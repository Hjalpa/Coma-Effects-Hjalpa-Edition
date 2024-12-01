// ==UserScript==
// @name            TagPro Coma Effects - Hjalpa Edition
// @version         0.5
// @description     Particles can be fun https://www.reddit.com/r/TagPro/comments/mtu50m/does_anyone_know_a_script_to_get_trails_like_this/
// @match           https://tagpro.koalabeast.com/profile/*
// @match           https://tagpro.koalabeast.com/game
// @match           https://tagpro.koalabeast.com/game?*
// @match           https://*.parretlabs.xyz/flagtag/
// @match			https://*.koalabeast.com/game*
// @require         https://greasyfork.org/scripts/371240/code/TagPro%20Userscript%20Library.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_xmlhttpRequest
// @connect         koalabeast.com
// @author          Comakip, Hjalpa
// ==/UserScript==


/* globals tagpro, PIXI, jQuery, $, tinycolor, tpul */

// Preferences
const settings = tpul.settings.addSettings({
    id: 'ComaEffectsSettings', // A unique ID for your panel
    title: 'Coma Effects',
    buttonText: 'CE',
    tooltipText: 'Configure Coma Effects settings',
    fields: {
        trails: {
            label: 'Speedy trails', 
            type: 'checkbox', 
            default: true 
        },
        kiss: {
            label: 'Kiss with love!', 
            type: 'checkbox', 
            default: true 
        },
        balloon: {
            label: 'Pop like a balloon (kinda)', 
            type: 'checkbox', 
            default: true 
        },
        capConfetti: {
            label: 'Cap Confetti', 
            type: 'checkbox', 
            default: true
        },
        agressiveRb: {
            label: 'More aggresive RB defusal', 
            type: 'checkbox', 
            default: true 
        }, 
        grabAnimation:  {
            label: 'Animate grabbing a flag or pup', 
            type: 'checkbox', 
            default: true 
        }
    }
})

// Hide settings button everywhere except profile
if (!(window.location.href.includes('/profile/'))) {
    settings.button.classList.add("hide")
}


// Trail colors, change to match texture pack.
const trailColors = {
    // red
    1: {
        "start": "#fe7045",
        "end": "#851600"
    },
    // blue
    2: {
        "start": "#3bc9ee",
        "end": "#003785"
    }
}

// Trails logic
const initTrails = () => {
    // Particle definition.
    tagpro.particleDefinitions['trail'] = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": 1,
            "end": 0.5,
            "minimumScaleMultiplier": 1
        },
        "color": trailColors[1],
        "speed": {
            "start": 0,
            "end": 0,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.15,
            "max": 0.15
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": -1,
        "maxParticles": 256,
        "pos": {
            "x": 20,
            "y": 20
        },
        "addAtBack": false,
        "spawnType": "point"
    }

    // Override createPlayerEmitter for trails.
    tagpro.renderer.createPlayerEmitter = function (player) {
        if (tagpro.renderer.options.disableParticles) return
        player.sprites.emitter =
            new PIXI.particles.Emitter(
                tagpro.renderer.layers.midground,
                [tagpro.renderer.particleTexture],
                { ...tagpro.particleDefinitions['trail'], color: trailColors[player.team] }
            )
        player.sprites.emitter.keep = true
        tagpro.renderer.emitters.push(player.sprites.emitter)
        player.sprites.emitter.emit = false
    };

    // Change trails emitter color when swapping teams.
    let defaultUpdatePlayerColor = tagpro.renderer.updatePlayerColor;
    tagpro.renderer.updatePlayerColor = function (player) {
        const color = player.team == 1 ? "red" : "blue";
        const tileId = color + "ball";

        if (player.sprites.actualBall.tileId != tileId) {
            tagpro.renderer.emitters.splice(tagpro.renderer.emitters.indexOf(player.sprites.emitter), 1)
            tagpro.renderer.createPlayerEmitter(player)
        }

        return defaultUpdatePlayerColor(player)
    };
}

// Kiss Logic
const initKiss = () => {

    // Particledefinition
    tagpro.particleDefinitions['kiss'] = {
        "alpha": {
            "start": 0.6,
            "end": 0.3
        },
        "scale": {
            "start": 1,
            "end": 0.4,
            "minimumScaleMultiplier": 1.2
        },
        "color": {
            "start": "#ff03ab",
            "end": "#f09cf0"
        },
        "speed": {
            "start": 200,
            "end": 200,
            "minimumSpeedMultiplier": 3
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 100
        },
        "lifetime": {
            "min": 1.5,
            "max": 1.5
        },
        "blendMode": "normal",
        "frequency": 0.4,
        "emitterLifetime": 0.8,
        "maxParticles": 16,
        "pos": {
            "x": 34,
            "y": 34
        },
        "addAtBack": false,
        "spawnType": "burst",
        "particlesPerWave": 12,
        "particleSpacing": 45,
        "angleStart": 0
    }

    // Create heart texture.
    tagpro.renderer.particleHeartTexture = base64ToTexture(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAsCAYAAAAjFjtnAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANPSURBVGhD1ZnLaxNRFIeTaaW2YkXaha9qF6KgtlqqoCjipiUKQt3rSvwDdKXgqoK6EroQFF0JrlwpulBoEESsBa0LDYiP2of1lVoVoy1q4nfmnlRsmyaZzCRzP/hx7ty599zfmUdmOo1G5iGdTi8mdKFOtBmtRAvRdzSI+qPR6A1inJgmFkwmk6lCHTT3o22oGS1Ck2iUfAPsv0P7uuM4KWLhYLyeyWeJ34h5YdwLdIjmvAdEYIzD2MNo0J2cB8ZNoG4kxeWHObsYPGymFwfzetFyTTULhqxm/z0zujiY9wrJmcoNAw6gSZ3jCeaPok2achp2tdP/wYzyBvN/oJim/B927EQlmc9Cno9onaaW3C3os+4uCfKkCO2aOuJes3TWE55y4zTJth+wyHOCnPIF6BG55Sb1BXK/JLRyc/90TFfkhJ/mBfKtJ5xD5/00L5BvLeGY2+boy0/lWzol+oqccvLm/WXyAqmTpG6SM9AVhHkhKPMCqRspYq8UIA8TW+mUAtpM20q2SAHyemArq6SAWtO2klop4I9pW8lvKUDeLG0lJQUkTdtKPkkBQ6ZtHzwLhqWAhNm0koRDFf26YR08iR/Ku1AD7fcUUm267QDz8qdnI2+kzjiNXrfXLm7J38pyD8jNcMHtsoisZ/dtkdPhoAE6W2U77OC1j6O/Q9rZMyCfRI6yIyPbYQaLrlezpQUIVBQnXDJboaYHr33aNpdQFqqrQw/CeinhTX7yd1PAlOmZUYDAoGYtYpl2hQI8jRC2Y37M9BimL6EsGH9D2MeEL6an8uBF3tdiM80LswoQGDhAkA9IX92OCoL5cQ5qB56Kf+XhKb0VJUlSEVj7HWpRO94gwQY0ojnLBmu+RvL9p3TIJx9ln5nUwcNaj1HOj8SeIO9SdNddIUAwfhsF8p1KLqcadFXX8h1yXybIt9TgYAF5BT/trugT5BNO6hLlgQWPoF/qwTPkmEIHNW15YeEYKujfUHPB3AnCHk1XGTDRhsaMpcJhzhDaqGkqC0bWoIR6ywtjn6AVOj0cYKgB3VePOWFMnLBEp4ULjNVh8KbrdA7Ydw3V6PBwgs9qTF4xlv9B30VClQ4LNxiVZ0WP6xxon9FddoHxU/g/rpsBEIn8BRzr9nxbG8MBAAAAAElFTkSuQmCC'
    )

    // Create kiss with hearts flying around.

    //  var kissez = ['kiss1', 'kiss2', 'kiss3','kiss4','kiss5','kiss6','kiss7','kiss8']
    //  var randomkissez = kissez[Math.floor(Math.random() * kissez.length)];
    //  var kissaudio = new Audio(randomkissez); // urls


 //   var kissez = ['kiss1', 'kiss2', 'kiss3','kiss4','kiss5','kiss6','kiss7','kiss8'];
 //   var kisssound ={};

 //   switch (sound) {
 //       case 'kisssound':
 //           for (var i=0; i<kissez.length; i++) {
 //   kissaudio[kissez[i]] = new Audio({
 //       urls: ['https://raw.githubusercontent.com/hjalpa/sounds/main/' + kissez[i] + '.mp3'],
 //   })
    var kissaudio = new Audio("https://raw.githubusercontent.com/hjalpa/sounds/main/kiss5.mp3");

    tagpro.renderer.createKiss = function(x,y) {
        if (tagpro.renderer.options.disableParticles) return
        const kissEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.foreground,
            [tagpro.renderer.particleHeartTexture],
            tagpro.particleDefinitions.kiss
        )
        kissEmitter.updateSpawnPos(x,y)
        tagpro.renderer.emitters.push(kissEmitter)
        document.getElementById("pop").pause();
        document.getElementById("pop").currentTime = 0;
        document.getElementById("friendlydrop").pause();
        document.getElementById("friendlydrop").currentTime = 0;
        document.getElementById("drop").pause();
        document.getElementById("drop").currentTime = 0;
        kissaudio.play();
    }

    // Keep track of flag carriers of last frame
    // TODO: support multiple flags
    let lastRedFlagCarrier = false
    let lastBlueFlagCarrier = false

    // Check if both died at the same time
    tagpro.events.beforeUpdatePlayers = tagpro.events.beforeUpdatePlayers || []
    tagpro.events.beforeUpdatePlayers.push({
        beforeUpdatePlayers: () => {
            if (lastRedFlagCarrier && lastBlueFlagCarrier && lastRedFlagCarrier.dead & lastBlueFlagCarrier.dead) {
                // Get the difference of coords
                const dx = Math.abs(lastRedFlagCarrier.x - lastBlueFlagCarrier.x)
                const dy = Math.abs(lastRedFlagCarrier.y - lastBlueFlagCarrier.y)

                // x and y can not be more than one ball width different. That's 38px
                if (dx <= 38 && dy <= 38) {
                    // Get average coords of both deaths
                    const x = ((lastRedFlagCarrier.x + 19) + (lastBlueFlagCarrier.x + 19)) / 2
                    const y = ((lastRedFlagCarrier.y + 19) + (lastBlueFlagCarrier.y + 19)) / 2

                    // Create kiss
                    tagpro.renderer.createKiss(x,y)
                }
            }

            // Reset flag carriers
            lastRedFlagCarrier = false
            lastBlueFlagCarrier = false
        }
    })

    // Get latest flag carriers
    const defaultUpdatePlayer = tagpro.renderer.updatePlayer
    tagpro.renderer.updatePlayer = function(player) {
        if (player.flag == 1) lastRedFlagCarrier = player
        if (player.flag == 2) lastBlueFlagCarrier = player
        return defaultUpdatePlayer(player)
    }

    // Update latest flag carriers with new info
    tagpro.socket.on('p', function(player) {
        if (player.id == lastRedFlagCarrier.id) lastRedFlagCarrier = player
        if (player.id == lastBlueFlagCarrier.id) lastBlueFlagCarrier = player
    })
}

const initBalloon = () => {
    // Balloon particle definition
    tagpro.particleDefinitions['balloonSplat'] = {
        "alpha": {
            "start": 0.8, //0.43,
            "end": 0.4, //0.12
        },
        "scale": {
            "start": 0.2,
            "end": 0.001,
            "minimumScaleMultiplier": 1
        },
        "color": trailColors[1],
        "speed": {
            "start": 0,
            "end": 0,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "noRotation": true,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.5,
            "max": 0.5
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": 0.1,
        "maxParticles": 1,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": true,
        "spawnType": "point"
    }

    // Flaccid Splat particle definition
    tagpro.particleDefinitions['fSplat'] = {
	"alpha": {
		"start": 0.8,
		"end": 0.4
	},
	"scale": {
		"start": 0.4,
		"end": 0.001,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#1c5218",
		"end": "#ffffff"
	},
	"speed": {
		"start": 0,
		"end": 0,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 0
	},
	"noRotation": true,
	"rotationSpeed": {
		"min": 0,
		"max": 0
	},
	"lifetime": {
		"min": 5.75,
		"max": 6.25
	},
	"blendMode": "normal",
	"frequency": 0.001,
	"emitterLifetime": 0.1,
	"maxParticles": 1,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "point"
}

    // Shards particle definition
    tagpro.particleDefinitions['shards'] = {
        "alpha": {
            "start": 0.8, // 0.4,
            "end": 0.1
        },
        "scale": {
            "start": 0.1,
            "end": 0.2,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#f72900",
            "end": "#851600"
        },
        "speed": {
            "start": 20,
            "end": 20,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.1,
            "max": 0.15
        },
        "blendMode": "normal",
        "frequency": 0.002,
        "emitterLifetime": 0.2,
        "maxParticles": 8,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "circle",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 50
        }
    }

    // Create balloon splat texture.
    tagpro.renderer.balloonSplatTexture = base64ToTexture(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWwAAAFzCAYAAAAaHzP3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA0cSURBVHhe7d1PbhzHFcBh28kBkmWQhZETGPAJcokcJsfIgQxwkV0AA15lkQWhBZFVNr6AzBJ7ohE1HPb01J/3qr4PMEQSNsip6v7NmxpJ/gYAAIB7fHy2fQgk8t32K4sRbchHsBcm2pCLYAMkIdiLM2VDHoKNaEMSgg2QhGDziSkb4hNs/k+0ITbBBkhCsPmCKRviEmy+ItoQk2ADJCHYXGTKhni+3X5lMXuD/O2z7UNgMBP2gm6Znm/5d+EtrqM6BBtoSqzrEWze5YbjqNO142itDou4qKMRduOxx+vry3VThwkbqKaEutg+pTLB5iZuRt7i2mhPsLmZG5Nz5Xootk9pSLA5xA1K4TroS7CBm5VQF9unV3nDsR4Luai9N9sebsh1HLluXB/1mLAXVDPWrMN1M55nvkW1uPlMUvO653pxXdRjIRfUItbn3KDzuPdacS3U5UhkQW4i3lNCXWyfEoRgL8iNyDWuj7hMWgvqdUOa5HNpcV24BuoyYdNMryeGcw9PjwJxwIi94naCTVMDQvCnf374zx+2j7t4fpL44/ZhKmVvTrYvVWW6rs+CLqjVDfoeN3AcPa4B+12fCZtuRj1R8FnZg2L7lGQEm67EYhxrn5+XLAuKdON62dzeqP22t/WZsBkq0pNHCz9/+KXb4zv/XmVdT7YvMQHBZjhRqePH73/49lOhn21fYjKCvZioN7PI3KesX7F9yqScMS0mw009y9nnw9Pjx7/++S/NHkvkvXR+3YZFXUyGYJ9cu+lbxzCqWfaPYyzoYjLd8Cdu/Hz7Zs/asKiLyRjsc6uEwD5xiUVdSPYInMwcA3vENRZ1IbPE4NwMYbAv7GVRFzJjGM5lioS94AiLupDZI/FapGhYe2qwqItYLRhv6RESay3YrUz7Jx1/+vCrQPGVEtPX3vr6UZ++ETQwbbB/9/v/bR/BdSJLFl62LEKU6MmRSBv+8ieAJJYJ9sPT47+3X//26QsLMV3DHLxsWYBg05PjkHYciUxOrGEegg2QhGADJCHYAEkI9sScX8NcBBsgCcGelOka5iPYAEkINkASgg2QhGBPyPk1zEmwgaoMDO0I9mTcLDAvwZ6IWMPc/DWIExBqovFXrLZhwp6AmwPWINgASQj2BByJwBoEGyAJwU7OdA3r8GZVYmJNZN4Mr8+EDZCEYCdluob1CHZCYg1rEmyAJLwpkIzpmky88ViXCTsRsYa1CXYSYg0IdgJiDRSCHZxYAyfeEAhMrJmBNx7rMWEHJdbAa4IdkFgDl3ipEoxYMyPHInWYsAMRa+Aaz3oBCDWzM2HXYREHE2tWIdr3cyQykFgDt/CMN4hYsyJT9n0sXmdCzcoE+z4WryOxBtG+h4XrQKjhM8E+zsI1JNRwmWgfY9EaEGq4TrCPsWgVCTXsJ9q3s2B3Emk4RrBvZ8EOEmq4n2jfxmLtJNBQn2DfxmJdIdLQnmjvZ6FeEWnoT7T3WX6RBBrGE+x9plqkEt9LGy/KkINwX7d7cd6L3siFFmSYg2BfVy3YADWI9ttuWhjRBnoQ7cv8H2eAcAyHl938LGYhgV5M2l86tBiiDfQi2p8dXgjRBnoR7RfOsIHwDIgv7nrWsohAbytP23c/cNEGels12lUetGgDva0Y7WoPWLSBEVYKd9UHKtrAKCuEW7CBqcwc7uoPTLSBCGYMt2ADU5sp3E0eiGgDEWWPd7MfXrSByDLGu+kPLNpAJtEjLtgAr0QNd/MfSrSB7KIEXLABDuod8i7fTLSBFd0a9FMr3/rvBBsgmKHBLkQb4H1vxbroFuxCtAHedi3Whf9FGEAA78W66DphF6ZsgC/tiXXRPdiFaAO82BvrwpEIwCC3xLoYMmEXpmxgZbfGujBhA3R2JNbFsAm7MGUDqzka60KwATq4J9QnQ49EajwAgFU4wwZorNZwGmLCdTQCzKj2KYIJG6CB2rEuwpwhm7KBWbSIdWHCBqioVayLMMFu+SABZmDCBqik9eAZbqp1lg1k1OOUwIQNcKcesS5CnhubsoEsesW6cCQCcFDPWBeORAAO6B3rIuSRSGHSBqIaEevChA1wg1GxLsIGe+SiAERkwgbYafQgKdgAO0R41R/+2MGbj8BoEWJdmLABkhBsgCRS/E4MxyLACFGOQk5M2ABJCDbABdGm60KwAV6JGOsixRl24Rwb6CFqrAsTNkASgg2wiTxdF4INkIRgAzyLPl0XaYKdYTEBWjJhA8vLMhAKNkASgg0sLdNxq2ADJCHYwLIyTdeFYAMkke63yvk7RYAask3XRaoJW6yBlaUKdsZnRCC2h6fHj+Wf7dPQHIkAy8k6/HnTEeBZhinbhA0sx4QNkEDWWBeCDZCEYAMkIdgAOzw8Pf59+3AYbzoCS3GGDTC55wn7H9uHw5iwgaWYsAESyBzrQrCBZWR/hZ7q2cZxCHAPEzZAEtmHPsEGSEKwgWU4EgFIwpEIAF2kCXb2Z0aAe5mwAZIQbIAkBBtYSubj1RTBdn4NYMIGSEOwAZIQbGA5WY9Zw/8xTefXQCvZ/qi6CRsgidDPLqZroLVMU7YJGyAJwQaWlumVfNhgOw4B+JIJG1helgEx5GG76RoYIfobkEMm7IenR0EGwok+LDoSATizN9ojBs9w43/0ZzhgDRGPR0zYAO+Icowb6hnEdA1EEm3KNmEDvCHaEBnm2cN0DUQWYdoOEWyxBjIYHW1HIgA7jR4uh0/Ypmsgm1GTtgkb4EajBs2hE7bpGsiu57Q9LNhiDcykR7iHBFusgRm1jrYzbIBKWg+j3Sds0zWwghbTdtdgizWwmprhdiQC0FDNQbXbhG26Brhv4u4SbLEG+NKRcDc/EhFrgDqaTthiDfDZPcchRbNgizWwsnvjfEmTYIs1sLIWsS4EG6CCVpE+V/0biDWwih6RPlf1m4k1MLvekT5X7RuLNTCrkZE+V+WHEGtgNlEife6uH0iogdlEDPWJv/wJWN4p0pFjXRz64UzWwAxKoEvPoof65OYfUqyB7LIE+rWbfmixBrLLGutCsIHpZY70uV0PQqiBbGaJ9Ll3H5BYA5nMGOqTqw9MrIFMZo518eaDE2sgk9ljXVx8gGINZLFCqE+uPtAS7rIYp4CffwwwSmnR9uFSmj5ocQdqWjXUJ90fvIgDR6we62LYAgg3sJdYvwi3CEIOnAj1l0IuhmgDYv218Asi3rAWoX5bqoURb5ibWF+XcnGEG+Yj1u9Lv0DiDfmJ9T7TLJJwQz5CfZvpFku4IQexvt20CybcEJdYHzP1ook2xCPWxy2xcMINMYj1fZZZPNGGscT6fsstoHBDf2Jdx5KLKNrQj1jXs+xCija0J9Z1Lb+Ywg1tiHV9FvSZaENdYt2GRd2INtQh1u18t/26PBcZEJ1IvWLShuMMPm2ZsIEqxLo9C/wGkzbsJ9Z9mLDf4AKEeB6eHv+7fbgkUXqHSRuuM9z0Y6F3EG24TKz7ciSyg4sSiECwgUMMMv1Z8Bs5HoEXgt2fBT9AtFmdWI/hSAQgCc+SB5myWZXpehwT9kEuWqA30bmTSZuVGFTGMmEDJOHZsgJTNiswXY9nwq7AhQz0IDQVmbSZlaEkBhM2QBKCXZEpBGhJsIGrzgeRh6dHx34DmQgbcJbNbLx6jMEmNCLazEKs43AkApCEZ86GTNlkZ7qOxYTdkIsdqEmwG/FuOlCbCbADRyNk5VViLCZsgCQEuwNTClCDYAMXGTTiEexOXPzAvQS7I9EG7iHYAEkINkASXqIP4Pdl99PjGGrW/XSEF48NGUCw64sYl+z7LNjx2JBBRPs+GWOSbc8FOx4bMohg32a2eGTYf8GOx4YMJNrXrRKMch2Uxxrtelhl/TOxIQNFu0EjEIkXEa4NexGPDRlMtIXhmpHXh32Jx4YMtnqwRWG/3teKvYnHhgSwWrRLCMpjFoTjelwz9iceGxJAj5svAgGor+W1Y7/i8UfTIbES1WL7lMnZ6CBmnbLFpK+a15G9i8eGBDFbsN3sY9W4nuxhPDYkiFmC7SaP5Z7ryl7G4ww7CDcHLZTrqtg+JTnBDiLzhL014ZPtS1P71+Pjx58+/Jpqv7btEe7kbGAgGaMtAi9+/vDLxx+//yHFWuy9zuxtPDYkkEzBdjPnt+d6s8+x2IxgMkTbTTyXa9ecvY7FZgQUOdpu4Hlduu7sdyzedGSXcuMW26dMyP7GJ9i8y428jrLXxfYpwdiYgCIdibh5IQ4TdkAiCVwiDEGNnrI9aUA8Jmy+ItYQkxszsBFTtlhDXG7OwHoGW6ghPkciAEkI9uJM1pCHmzW4lsciYg25mLAXJdaQj2AvSKwhJzduAjWPRcQa8jJhAyQh2AsxXUNubuAk7jkWEWqYgwl7cmIN8xDsiYk1zEWwJyXWMB/BBkjCFJbI3jceTdcwJxP2ZMQa5iXYExFrmJtgT0KsYX6CnYgow9oEIJnXbzyKOKzDhA2QhGAnZroGCG7v78cGAAAAAAAAAAAgl2+++Q24f7Bc+fzsKwAAAABJRU5ErkJggg=='
    )

     // Create Flaccid splat texture.
    tagpro.renderer.fSplatTexture = base64ToTexture(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB6CAMAAAAf+CTPAAAAAXNSR0IB2cksfwAAAAlwSFlzAABuugAAbroB1t6xFwAAAvpQTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Oov7nAAAAP50Uk5TABhOhrDAxsG5sqmglXdpUz4tHAoEa8z/+Org1sq4opSHgJ2utLaqo4FsSiMDC+L1mF4k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'
    )

    // Create Shards textures
    tagpro.renderer.shardsTextures = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAAAzCAYAAAB8HgbsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAVYSURBVHhe7ZzJqxxVHIXf02jEOc4aEUXFoBEFB5xwwvkvyNqVoIKKi7gQYxDMRkGC4MIJXIgbN7oQd+50I4oRXQQcQBM14qxxfH5fvbqhfXnxvR6qurr7fHCo6iIk0Olz7u/eX907F0IIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEKYNhYWFo6sb70/rL4NIUwjmHwN2og2oRfQTrQH7UXr0Ra0C/UdBvP1NYTQITDzmVw2otvQzehodCL6Fv2Ijqk/y0foKPQGenh+fn63D/shQRDCGMHwJ3DR8Bejq9AVSIP/hb5Gh6NT0IH4Dr2L7iIAdlZPBiBBEEIL1OW6hlc3oSuRIXAoKqP8qehYtBr2oF/QNgLgmerJECQIQhgxmF6zb0C3oBuQZf3x6Buk4b1Xg1DK/qcIgG31/dAkCEIYEAxvyX4p0vTXoMuQZb1m/x45bz8JjYIvkd2B7WgLIeDUYWQkCEJYAQxvua7ZNf3VyLK+LNQ5yv+K1iNH/lFjBeA6wUvoQQJgrw9HTYIghJp6Hq/h1e1I0xsCGtyFu5+QI/xxqGlcA3D94DV0DwFghdEYCYIwk2D6c7iUhTvn8pbxpT33AzIAyqjfJj8jy/630H0EwKc+bJoEQZhqMLwr87bmNL3tOeVC3R/IUXel9lyb2Ar8EN1LALxXPWmJBEGYCjC8C2mW9Jr+eqThHdEPQo7yjrRNzeOH5StkFfA4AfB09aRlEgRhosDwa7iUebxv3V2HLOPXIQ2l4Ydpz7XJLnQI2k4AbK2ejIkEQegsmP50Lo7wmv5GdBEq7TnLaEf3UbXn2sRWoFOS59BmQmCkrcBBSBCEsYPhHdGdw2t6V+qVI/o/yLLeN+gMhS6W9f1QXhl+GT1AAFi9dIIEQWgNDF/acxreN+40vCN8ec3W9pwLdwbDNGHrzynN6+h+AqDvTUFNkyAIjYDpyzz+DuTine05Ta4JNLxzelf0px1bke+guwmAgTcFNU2CIAwFhtfcZR6v4X37zrLeN+Ac5Y9AXWnPtUnZFLSVAHi+etJhEgRhVWB423NlHu979UrD254rP/qutufaxM7F3+gJAuDJ6skEkCAI/wHDl/acpr8VaXjLeA3ue/WW9c7r23jNdpKwFehah1uCR74pqGkSBDMMpi+n4Khrke25k5El/dJTcMLyuOZhtfQseogAaGRTUNMkCGYADF9OwSmGX3oKjj/eM9C+QzDDilgdrUWvIjsBjW4KapoEwRSB4XtPwbE9Z1k/zCk4YX/8Dn2/wU1BHg/WuVbgICQIJhRMX+bxy52C4zzeOfwkvGY7SZTzAd0VuKN6MiUkCDoOhi/tOU2/3Ck4s9qeGwarI1f3C3Y+Ct5b8hf8fl0rkXLq0L7jwgmEqfBQgqAjYHjLdUf5cZyCMy76MaSbc3o/+z34rODfVbB999vibcWfqHcV/2302eJtRe+ef9dLLPc9r+BO5KvNj6E3kezG+xO5IPh/JAhaBsPbnnN01/SX1Fc/O6p/jNyHfjk6H7WF7wG4aFjoNeTByDWGgmbsNaAB5p8pjNqQBUfj3gW5RgzJ/4+dlEeQB5Y8il7k35moVuAgJAgahB/VeVzcJns2uhCdi85CX6BPkOZTfrYP7ehjUJyGrApm1pDjoA7pD9AryGPCp27kPxAJghHAD6j3FBzNb3mvRAN6Go7mc7fZ58hVZ9nPVOj3xduKmTTkODEMZqECWEqCoA/4kfSegnNBfa/hHUlKWe9RU64o7+AHZckdQudJEKySumy0feQOMk3/PiqGb+WAyRBCCCGEEJpibu5fI6F0i1K5es0AAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAAAzCAYAAAB8HgbsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAUXSURBVHhe7Z1viGVzHIdnGCyW9WexFrUvvFhSRmgXKysSoTamtuTNljfilbfKO7EhlFKSTXYTKyWvyAslbUp54U+LkZL9x7LWWpaW8Tx3ztFtmsPMdf+dcz9PPZ25t7n3TLf5fn7f3++ce85YCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGE0GhmZmbOK37sC+zvnOLH2jJebEOoHRTgBJvVeAleWmzX4HK8YHx8fBfbrsN+l7JZh9fh7XgRrmR/+9iGEHoFxbcKb8Nn8HPcg0dxH36Jz+NruBevKF7WFXi/pXgzbsFv8DB+hS+h+7+z+NUQQjegqJbjerwfX0UL7zc8hBafATAf07gDVxRv1TG8R1Xh78d2fHxP8bJak6lBGAgU0BI2tvJ6I16FtvTH4w/4M56Lp+F/8SO+h1O050dbzywC/pay1d+IN+CZuBeXFT/Ph3/jdvZ37+zDEMK/QqGtxil8Dm3jbadt6x3dv8C5I+1icLR+vNjVguD3FzriV+H04+Xi7RpBOoLQNSgO23Ln5y7gOcJeiWeho/tPeAqejd3ALsDFwocYlZ9uPVMBf1cnI34Ve/BjvLWT7mNYSRCERUNh2a5b7Bb9NWhbb8HL9/gregjvVJ/oAbvxF7QYp1vPtNHlwm/H9/BIxDr2e6T1TENIEIRKKChHXOfwFv0taNEbAha4Be9I7wh/BvaL79AReQPFaBj0svDb2Y8HcbLcb5NIEIQWFNOFbMqFu5vQNt5R3kUxC8AAKEf9QWEBOjd/AHtd+O24X72MEHA/jSNBMGJQ8K7MT6JFf3WhxfMHOuqdhP/7EFwPsBA/xZXY68Kfi53PGkJg5+zD5pEgaChFu2xLb9GvR+fxtvHHoKO8hdXLeXw3OYR2JSdiPwq/Hfe7jRC4b/ZhM0kQNAiKfwn/sEfYXsvDt9GVdQve4ul3ATUJFz//Qj/PD3EHukhphzDNZ177owcJgoZA8buw9zV+i47yF2PoPk4T/Iw9IaqcmriAadfyPhoSBsTOOq0nJAgaRBEGHtK7G13ld67vNOAE7Nbx+1CNn3W5zlJ2YAfwI/wAWx1EsZ0gKOzWhoIEQYOpCAYP+/mPOugjAKOEBf862kFcjq7N2FmscCrHduAkCEYI1xDYrMW70EOEhkGCoT98hk7ZnFa8iFvTEYShoCIY+nlYbhTwGgUnox3BYxT/Jz45bCQIwj8QDP04Q28U8PsIfmZut+BmAmCojywkCEIlFcHgef6elLSQrwePEh5a9KQs12VewUcpfqcBtSBBEBYMwWDxe3LSFF6PPh71YHDUPx3fwqco/nd9sm4kCELHzAkGOwYXHZ1KeHSiDmcsdornDXgBlcO4DR8hAPyadW1JEISuQTAYAAbDHeiFPV2MbFIwlAt/b6Ct/1Au/HVCgiD0jHmC4Vj8Hf3iUF0oF/4MtBfwCQKgUdcikARB6BsEwyo2XuzTq/6W5y0MYzCUC3/H4XZ8uE4Lf52QIAgDY55g+LPQi5YOgnLh7x105K/lwl8nJAjC0EAw+LXpTbgBnVbYgvc6GDyz0pG/MQt/ITQKgwE3ozc0OYhe9bjqvgaLxSsRe6+ErehFWkIIdYCCncQn0UuiewnyXbiYYNiN5Y1SHkSPaoQQ6gyFPDcYvEeB90xo5wAaFt6z4Fk8v3h5CKFpUOATuBa9N6IjviO/IfAmeggzhDCKEACe9x9CCCGEEEIIIYQQQgghhBAWyNjY35amdU1yOSHKAAAAAElFTkSuQmCC',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAAAzCAYAAAB8HgbsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAASESURBVHhe7ZzNq1VVGIfv6fNaVvZhpURGRfZlBDUIpJl/gAPJQQOJBg7EUSBGUEKDHAkFEUQQjpo1bFiBEwsNB2mJKNpApdQ+TE2zrr9nn71QLvfo9Z7Dde99ngce9j7rnnv9wPe313rXOk6IiIiIiIiIiIiIiIiIiIiIiIiIiIjIfDI1NTVZ3zaSXn0VkZoU7cO5ULjIPcw09mxcEW+KT8UjcUG8Od4a744r4wvxnbii1+v9kWvjMAik9aRwH8hlYbwlPsJYmGlseXwx8u++PKGnFy78Hc/HqXiGgXAh/te/nfi/vvJzy/cM4mA8Hd9ICOypRhqIQSDzzpCFe3ukaCneRQyEURbuKOH39WVcnxD4pxppKAaBXJMULgVXiu6x+jpM4Z6N5/q3VbHAv/Fi//aGFe6oOB75829JAHxYjTQcg6CDDCjcmcaejC/1b6spMlC0FC/cX19nW7hLY/k1xpVTcVdc29R+wEwYBB0ghU+R8hQqBc40mTGmxsci0+QTkfdQtDS14LX4TP9WhoS/X2YB2xIA71UjLcIg6AAJAqboTNUJAq5IZ3vZtNd8nacUgYA83R+PD0beI3Pj13g4Mgvg2joMgjGjbtSVYGANzvW5+EpkSYAEC2vzv2JpxCGzCd5/X5Q+NAE/jW8lBMpSqXUYBDKQhAZBUYKDe3w6vhyZBt8Z74iEBzMNegksQ+gfEBptbfbNBpZcNEA3JQC2VyMtxiCQoUlglJ0DZgtYgoMDN+wiEBSEBqFA34ItPmYahAZPUd6/OLYFZkpfRc4GNHpbcLYYBDKvTOtnlNDg5N2r8bZIaDDbYMeCsCg7FhQcIXIj+xllW/D9BMC2aqQjGATSWOp+RgkLgoMQ2BwJBmYSbHkSLFwJjLKlSWDw1Ob7RrWdWbYFX08IsEPQKQwCaRUJB4Lhg7gqcnR30PYnxUrx3htZyzPbQJYxJTQIjD8jjdBB/Qx+BrOAjxIAb1cjHcQgkFaSQOAw1MeR3Y5hGpIsP36JhASzBz5AxD3Fzz1NTxqDzEJ+iPsjW4QsEwibEwmIVm4ZXolBIK0mgbAul3cjT34cFTQ0mTlc2cRkZ+RoLGFRmqAECIFStloJje/jT5HAIChKaPC6cRgE0gkSCBty2RTZzhymmcjhoPKJRH7WXNkXmUE8ER+NnL1glpEs6DWu7gwC6RQJBJqJGyOF/BBj1wFPdPoOS6pX1085tclShcbmz5GPHu+ur3uSAY38/IFBIJ0jYUBDcEtcH2kKXquwf4t3RZYCsz01SRPxZLwnsiRhJvFd/CbujD+m6FtzxsAgkM5SB8LW+GakyPl05HQoaMLiarMH1vc8yVlyML2n6HfEbyNbihR9a48Xi4wFCYTJ+Ek8HY9FOBl5vbd6dRm+fjDytTPxUNwe18Tn6x8pIm0lhbwofhEvxiPx87grnou/xwPxs7g6cq5gbHBpIGNDiptTiBwgwq8ja3kaejszte/caUERGUDCgP+jQURERERERERERERERERERERERERERERERERERERERERERESuzsTEJaVWdIUP/FFMAAAAAElFTkSuQmCC',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAAAzCAYAAAB8HgbsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARxSURBVHhe7Z3LixxVGEdnNBrBYKJEjCiiGDBEhSAuXER0IUQkC8Ugik9EYUT/AREiIeBKEcEHSFwLQkBwk0VAxIWCIO5MfARjonk5mpgootHx/GZuQ1MoYs/0VN3qc+BQ3TXd1bOY7/dV3XtrekpERERERCaBubm5FeWhiEwSFP86fBI/xbO4tvxIRPoKhb4CN+NO/ARP4in8GG8qLxORvkGBp+s/hm/jT/gRvoX78X28pbxURPpEiht34WE8jftwB96K7+GXeHd5uYj0AYp6LabQU/Ap/G/xOA7zOR7CGXRgUKQPUMzp+m9iij7F/z3+EwmE/DyvXVXeLiI1QhE3u35O+5tdf5iMB2Qg8B1cVw4jIrVBAd+Mb+BB/AX/res3+RH34vpyKBGpBQp3DW7HXM+nm/9X129yDHOpMFMOKSI1QNGO2vWHyXtO4HPlsCLSZSjWVXg/vovp+kcwnXwUEgAZC3gRnQkQ6TIU6Q34Kn6D6fpfYAb8RiWXCzlOZgLWlI8RkS5Bcabrb8PdmI69mK4/TM4gcrwc15kAka5BYTa7/le4mK7fJDMBWRK8oXykiLQNBZmuvxUHXT8dP51/qTmKmT14uny0iLQJxbgBX8EDmG6frp/T9XEwmAnYXj5eRNqAIhx0/azO+wHH1fWHSQAkXF5GZwJE2oDiG+76udb/GsfV9YcZ3BOQuwY7NxMwXbYivYSiu4DN7fgo3pF9cBaXa1T+DObzPsCZ6enpo9kpImOG4l+PWYSTbr+cXb/JLH6Im8qv1lk8I5DqodCaXT9/139gW3Pxx/BPfIEzgNfm93Qcg0CqhOK/ms0zeA+m4FN8q/ESbIsjeB6+TgA8P7+nEgwCqYLS9Tfjw3gnnou/4+XYNrnuzz8F2YXPEgK/ZWdNGATSWUrXfwrvxcvwBLbd9Zv8jJkG3EgAHJzfUyHnlK1I66Tr44O4B0+z6wA+hNdiOu412KUQCBfhKXx8/lmleEYgrZLiZ5OBvkfwPvwLc71/IV6MtbCfM4Jq7xMwCGTZofhTMDnl34pdGehbLL/iasIgawaqwyCQsUPh57Q+A3wP4G2YqbV0/j7dapvxgScIgr0LT+vCIJCxQPHnG3Yyr38X5jv3vsMM+OWauo+cxD0EQcKuOgwCWRIo/HT3zOtvwyswA2jn46U4KcwSBFV+0ahBICNB4WfKLPP6WzCr+a7EFP91OKkcxy2EwWcLT+vBIJD/DSEwxybX+VnGO4tZUJNVddmXIMj1f7gKJ+nbd7LOYTdBkIHQqjAIZCTIgsztp/BzKpxij3mcM4WcHYQbcSNm2W32x0wXZlXg4FbcXFvnOFmNlxH3mIAJNQbKIYIgv29VGATSKgRKQiMB0ZdAyUrD6wmDwwtP68AgkF5AoGQ5csigZUIiARHzeDBNmduBc+mSQcyESIJlZdkOZjMWGyj78CWCIPcdVINBIDLEUgUKQWBtiUwqBEnul8g/JU1wiMikYgiIiIiIiIiIiIiIiIiIiIiIiIiISM1MTf0N+oqRaWi5ergAAAAASUVORK5CYII=',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAAAzCAYAAAB8HgbsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAVeSURBVHhe7Z3Ji1xVGEe7Y+KUOGCMSTTOQpwCAUWycBExSMCIUeOARET/AA2IE1m5yEIQRGhwI7hQN4IgCBpBcGE27oTgzqCJxszGGGMcou05vvc2bVV3DV1d71X/DhzuvdWVSmX4vvruffe+GgshNJPJyclzy24IYT5h8OMGfAeP4JLyRyGEUYeAvxF34Bncjdvw0vLHIYRRxUDHV3EfnsCvcY+PlU8JIYwiBPlC3ISf4in8Eaeyr3x6CGGUILjX4rvoJ39VAbTDn91Q/tIQQpMhmFfg67gfj+Nh7IQD+Fb5MiGEpkEAu+q/Hb/BdqV/JxwvXzKE0BQI3HX4Pp7Eg9gvVhEbypcPIdQVAnUVTuAh9Jq/zhbH8MPyt+qb8bINIcwCBKe7/V7GJ3A5nsCVOAh+w+Xj4+O/FsMQwlAhAaz3Exr7mfd3i7/PK+Vb6ItUBCH0CEHoJbwX8EH8C8/GS3Au+ZaK4Lqy3zNJBCF0AcHv3v7t+Dga9JblK3BYOD1YTTL4oRiGEAYCwe9uv434EZ7GuSr9O8H3MlG+1Z5JRRBCGwiwW2mew814Ci/AC7FuHKYicGGyZxaUbQgBCH4P+ryGltpf4Ea8GK/AOiYBWcD7XVf2eyKJIMx7CCJL/834GcO96PzfwDcBDHP+3ymT+GzR7Y1MDcK8hcC/nWYb3o8/oYt/Tb3Rh4uWy5gi/F4MuyMVQZhXEPwe9HkDDzDcifegwX9V2TaVY+g0pidSEYSRh6B3t5/X+59ES/2f8XIcJawIvqQi6On8QRJBGFlIAHfSPIP34i/YhPl+PzgtuJJkcLQYdk6mBmGkIPg96PMmHmH4Ad6F5+OoJwHxaPJLRbc7UhGExkPQO7c3ALbiMhzkQZ+6s5+KYFXZ75hUBKGxkAC8rbdHcQ/h03g1+uk/X5OALObvxI1QXZGKIDQK/pN70MdP/4fQffYGvtf7Q8FB3ElV8FQx7IwkglB7CH4D3TP+j2EdDvrUHa+KuKfgTDGcmUwNQi0h+Kvben/McD96o4/qWn+SwPRYKa0vup2RiiDUCgLf+e3z6EEfF/0uwrru8a8rVgS7qAjuK4Yzk0QQhg7B71d3ecb/EXTO/ydehqF33FPg9KCj25hlahCGAsHvbb23oAd9vsdH0d1+rgckCfRPV3sKUhGEOYXA96CPZ/w3ofvjl2KT9/jXmb1UBNeU/WlJIggDh+B3g4ufTg/jWfgPuvEnDBanBWtIBt8Vw/ZkahAGQln6b8VPGO7Gu9GS3wogSWBuOIkvFt3pSUUQZh2CfyGN8/6v8D18G93o4uN/oIuBf6OVgckh3/M/OI5SEcyYeJMIwkAgGSypVqzLxOD0wLUAg17t+9j16G22fM4iPA+dPlg5eItwTw2aPOzbmjzUe/T5nDA9nkR8gH+LXcWwNUkEobaQQLyPgJuHvJJQ3TbMx1wAuxbvQJOHSWRx2fo8L515s1Fbd9fZejsvE4ivMdffPTBMTASfkwi8NNuWJIIwcliN0EytPEwgtp5VuA39MhIrD39uMnHTkjvyTpetScO+CUSrS5tNxD/PUpKBCbElSQQhlJBAWlUeVVWyGtfiOWgCsQKxbyJxCuS0xSrEtQ/7VQIx+Qx7Z6TrMxMkgh3F8P8kEYTQJySQVpVHVZXcjGvQtQ+v0rlz0r6t6x+ufZhITCAuolqJyGwnkD0kAquhliQRhDAkSCCtKo+qKjF53II+7tqHrVWIrWcJXPuwArE1mVQJpN1NWE02K0kG/y3gTiWJIISGQQJpVXlUVYnTl5vQaYtrH7ZWFotIAon3EEIIIYQQQgghhBBCCCGEEEIIIYQQwkyMjf0LURcYPGYdEs4AAAAASUVORK5CYII=',
    ].map(base64ToTexture)

    // Create emitter
    tagpro.renderer.startDeathEmitter = function(startColor, endColor, x, y) {
        if (tagpro.renderer.options.disableParticles) return

        // Balloon splat
        const balloonSplatEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.foreground,
            [tagpro.renderer.balloonSplatTexture],
            {...tagpro.particleDefinitions.balloonSplat, "color": {"start": startColor, "end": startColor}} // I don't like the default end color
        )
        balloonSplatEmitter.updateSpawnPos(x,y)
        const balloonSplatEmitterInside = new PIXI.particles.Emitter(
            tagpro.renderer.layers.foreground,
            [tagpro.renderer.balloonSplatTexture],
            {...tagpro.particleDefinitions.balloonSplat, "scale": {"start": 0.14, "end": 0.001, "minimumScaleMultiplier": 1},"color": {"start": startColor, "end": startColor}} // I don't like the default end color
        )
        balloonSplatEmitterInside.updateSpawnPos(x,y)

        // Flaccid splat
        const fSplatEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.foreground,
            [tagpro.renderer.fSplatTexture],
            {...tagpro.particleDefinitions.fSplat, "color": {"start": startColor, "end": startColor}} // I don't like the default end color
        )
        fSplatEmitter.updateSpawnPos(x,y)
        const fSplatEmitterInside = new PIXI.particles.Emitter(
            tagpro.renderer.layers.foreground,
            [tagpro.renderer.fSplatTexture],
            {...tagpro.particleDefinitions.fSplat, "scale": {"start": 0.4, "end": 0.001, "minimumScaleMultiplier": 1},"color": {"start": startColor, "end": startColor}} // I don't like the default end color
        )
        fSplatEmitterInside.updateSpawnPos(x,y)

        // Shards
        const shardsEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.midground,
            tagpro.renderer.shardsTextures,
            {...tagpro.particleDefinitions.shards, "color": {"start": startColor, "end": startColor}} // I don't like the default end color
        )
        shardsEmitter.updateSpawnPos(x,y)

        // Add Circle emitter
        const growingCircleEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.midground,
            [tagpro.renderer.particleCircleTexture],
            { ...tagpro.particleDefinitions.circle, "scale": {"start": 0.2, "end": 1}, "lifetime": {"min": 0.2,"max": 0.3}}
        )
        growingCircleEmitter.updateSpawnPos(x,y)

        // Push emitters
        // if holdtime is <= 1.2, push fSplat instead
        tagpro.renderer.emitters.push(shardsEmitter, balloonSplatEmitter, balloonSplatEmitterInside, growingCircleEmitter)
    }

}

// Confetti particles when capping
const initCapConfetti = () => {

    // Set particle definitions
    tagpro.particleDefinitions['circle'] = {
        "alpha": {
            "start": 0.6,
            "end": 0.1
        },
        "scale": {
            "start": 0.2,
            "end": 3,
            "minimumScaleMultiplier": 0.5
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 0,
            "end": 0,
            "minimumSpeedMultiplier": 0.001
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": true,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.2,
            "max": 0.3
        },
        "blendMode": "normal",
        "frequency": 0.016,
        "emitterLifetime": 0.1,
        "maxParticles": 1,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "point"
    }
    tagpro.particleDefinitions['confetti'] = {
        "alpha": {
            "start": 0.8,
            "end": 0.2
        },
        "scale": {
            "start": 0.5,
            "end": 0.1,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#9ff3ff",
            "end": "#9ff3ff"
        },
        "speed": {
            "start": 600,
            "end": 200,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 500
        },
        "maxSpeed": 200,
        "startRotation": {
            "min": 180,
            "max": 360
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.5,
            "max": 3
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": 0.01,
        "maxParticles": 32,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "point"
    }

    // Wait for flagcoords
    flagCoords.then((flagCoords) => {
        // No yellow flag
        if (flagCoords.yellow) return

        // Watch cap
        tagpro.socket.on("p", (e) => {
            const playerUpdates = e.u || e;
            playerUpdates.forEach((update) => {
                if (!update['s-captures']) return 

                // Create confetti
                if (tagpro.players[update.id].team == 1) {
                    tagpro.renderer.createConfetti(flagCoords.red.x * 40 + 20, flagCoords.red.y * 40 + 20)
                } else {
                    tagpro.renderer.createConfetti(flagCoords.blue.x * 40 + 20, flagCoords.blue.y * 40 + 20)
                }
            })
        })
    })

    // Get textures
    tagpro.renderer.particlePlusTexture = base64ToTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAA+CAYAAAB0g3ZRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMNSURBVHhe7ZrPq01RHMXv8Zt4FIpEkQFRSiYmYmJCyogMRDExoWQif4KRMpHZMzKQhDLzKxm9gQFl8hCP/Mrv58fjWOvsda9zr+vds3G+97TP/tR6a+/XPbe9191nn733vY1IJCORm5Km6WLYOmgV9A4agm4nSTIGDx8EcAwagzp5DO3Vy8IFnTyedXd8Turl4YHO7XR9LMQOXRYW6NhF179C3NNlJphMjOjUEthDVyvMACbK9yqXygR52WyQ+7BWXjpWISyX+/BGXjpWIcyW+/BaXjpWIcyS+2AyH5Aqh8CVpAlWIcyUF2UET4YfKpeOVQgz5EUZkZtQ1RC+yk2wCmG6vCimu1urEHy3yJPlJliF4DvJTZKbYBWC7/COIYAgQ/AlyDkhjgRQ6RD+2/M4TVM2fG5OcyAukrhGOAStgYrCR+ot6AX0EnoLfYSai6ipEJfiA9ACqbkgG4U+QNx7PIW4+ryKZfgNeFe6hoAOrYftgniwMR+aCOVhndvj/Mao8zVVg2Gchk4hkCfZf8RvISCAc7DtrhYkz6A9COKKq3aEUIMAmnyHNiKIm6y0QkAAK2F3Xa0WXEIIW1nIPx02y+vCFnzwU1jIh8Bj8bqxgn/yIdTjy9B2ssObfAjX5HVhGHMC1yBtIVyX14Wz8l8hIBWusg66WvAMQ0ddsX0kMIgTsH2uFiyvoMPoa+ug50/L5kWw3VI2g/YR3rdfXLHFN+gzxH0ClS9Pg5ZCXPfkP2S+B+e9/QjgUfYf0TWEPAhkE4wbonlyihsXkkK8jbi5+SSxIXR+l8iND3UGWg0VBg3t2bbxQLsZANvMzRXf7w69b6BBQ5AXutSEtjmhRDg6KotVCLxnK0sMAVQ1BG51zajqnBBkCL4jwexreWIVQudipxdBjgRfghwJvsSRAGIIIN4OII4EEEOwxioEHoL4EOSv13im58MDuQkxBGAVAs/2fH61flkeFmmaHnAHZz05r0vCBB08Ao1mXe3OIMSTblP+6UT3b0AnF8K2Qcuk5xDnjPtJklyARyJ9odH4CcrYuVhCO20tAAAAAElFTkSuQmCC')
    tagpro.renderer.particleMinusTexture = base64ToTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAA+CAYAAAB0g3ZRAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFoSURBVHhe7dc9SsRAGMbxRPzC9QRiIyqyl7C2t/YYFjbewHNo4QVst7AQ3U5BEKxFQVRQUTQ+r3kHgmCSCYvuwP8HD0+yLjIzjrPZDAAAAAAAAAAAAKOTe4+FoihmVfOeGc905dp+HjKpBA/KtSXP86fvVyJ0WgQNdkG14rFBBlNKdaBh8NVJ2AR73iHhvjqxrvaVPS3GWXk7Ypp8XzlQUtD3YTdqvRP0S5dUl4r9tVNwpN2w4de1YhbhULVZ3iWjp4V49utfTXi30WpVx8yad61Wi6BdsKiywys1c9612u4EO9VTdOFdq9Ui6P/qSvVZ3iXjWOO+9+taMWfC0DsVO96NYhZh23vcnSrr2gWD8rZZ1BOjDsgt1a5iT4r/pVDuPLfKjedcGWryJ+ooXR+b7XlhVVlWbDe9e94q1zbYnz4Ue094n7W9VmVnj30XePS22Gf9i/KqSUZ/NwAAAAAAAAAAAPgbWfYFLQPz+/RAIkQAAAAASUVORK5CYII=')
    tagpro.renderer.particleCircleTexture = base64ToTexture('data:image/png;base64,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')

    // Create confetti
    tagpro.renderer.createConfetti = function(x,y) {
        if (tagpro.renderer.options.disableParticles) return

        // Eyoowwww colors
        const randomColors = [
            {start: "#FF0000", end: "#FF7F7F"}, // red
            {start: "#FF6A00", end: "#FFE97F"}, // orange
            {start: "#00FF21", end: "#7FFF8E"}, // green
            {start: "#0026FF", end: "#7F92FF"}, // blue
            {start: "#FF00DC", end: "#FF7FED"}, // red
        ]
        const getRandomColor = () => randomColors[Math.floor(Math.random() * randomColors.length)]

        // Add confetti pieces with different colours
        const plusColor = getRandomColor()

        const confettiPlusEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.midground,
            [tagpro.renderer.particlePlusTexture],
            { ...tagpro.particleDefinitions.confetti, color: plusColor}
        )
        confettiPlusEmitter.updateSpawnPos(x,y)
        const heartColor = getRandomColor()
        const confettiHeartEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.midground,
            [tagpro.renderer.particleHeartTexture],
            { ...tagpro.particleDefinitions.confetti, color: heartColor}
        )
        confettiHeartEmitter.updateSpawnPos(x,y)
        const minusColor = getRandomColor()
        const confettiMinusEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.midground,
            [tagpro.renderer.particleMinusTexture],
            { ...tagpro.particleDefinitions.confetti, color: minusColor}
        )
        confettiMinusEmitter.updateSpawnPos(x,y)

        // Add Circle emitter
        const growingCircleEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.midground,
            [tagpro.renderer.particleCircleTexture],
            { ...tagpro.particleDefinitions.circle, "scale": {"start": 0.2, "end": 1}, "lifetime": {"min": 0.2,"max": 0.3}}
        )
        growingCircleEmitter.updateSpawnPos(x,y)

        // Push all emitters
        tagpro.renderer.emitters.push(confettiPlusEmitter, confettiHeartEmitter, confettiMinusEmitter, growingCircleEmitter)
    }
}

// Make explosions look more aggressive
const initAgressiveRb = () => {
    const trCreateExplosion = tagpro.renderer.createExplosion

    const createExplosion = (x,y) => {
        trCreateExplosion(x,y)
        if (tagpro.renderer.options.disableParticles) return

        const rbCircleEmitter = new PIXI.particles.Emitter(
            tagpro.renderer.layers.foreground,
            [tagpro.renderer.particleCircleTexture],
            tagpro.particleDefinitions.circle
        )
        rbCircleEmitter.updateSpawnPos(x,y)
        tagpro.renderer.emitters.push(rbCircleEmitter)
    }

    tagpro.renderer.createExplosion = createExplosion
}

const initGrabAnimation = () => {

    let onFlagTile = {active: false, flag: '', p: {id: 999}}

    // Check if player is on flagtile
    const createFlagGrabAnimation = (player, flag) => {
        const endTime = Date.now() + 250
        if (onFlagTile.active === false) {
            onFlagTile.active = Date.now()
            onFlagTile.flag = flag
            onFlagTile.p = player
        }
    }


    // Wait for flag coords
    flagCoords.then((flagCoords) => {

        // Only ctf for now
        if (flagCoords.yellow) {
            // console.log('yellow flag, return')
            return 
        }

        let lastTileGone = {
            tile: null,
            x: null,
            y: null,
            time: null
        }

        let lastGrab = {
            flag: null,
            playerId: null,
            time: null
        }

        // Add grab animations layer
        //tagpro.renderer.layers.grabAnimations = new PIXI.particles.ParticleContainer
        tagpro.renderer.layers.grabAnimations = new PIXI.ParticleContainer
        tagpro.renderer.layers.foreground.addChild(tagpro.renderer.layers.grabAnimations)

        // Add a new grab animation
        tagpro.renderer.addGrabAnimation = (texture, x, y, playerId, endTime) => {
            let sprite = new PIXI.Sprite(texture)
            sprite.x = x
            sprite.y = y
            sprite.alpha = 1
            sprite.ax = 0
            sprite.ay = 0
            sprite.playerId = playerId
            sprite.endTime = endTime

            tagpro.renderer.layers.grabAnimations.addChild(sprite)
        }

        // Update existing grab animations
        tagpro.renderer.updateGrabAnimation = () => {
            tagpro.renderer.layers.grabAnimations.children.forEach((ga) => {
                // Get time left
                const t = ga.endTime - performance.now()
            
                // Remove grab animation if time is over
                if (t <= 0) {
                    tagpro.renderer.layers.grabAnimations.removeChild(ga)
                    return
                }

                const player = tagpro.players[ga.playerId]

                // Remove flag 
                player.sprites.flagLayer.removeChild(player.sprites.flag),
                player.sprites.flag = null

                // Destination coords
                const x1 = player.x + 20
                const y1 = player.y - 20

                // Get ms of frame
                const frameTime = performance.now() - tagpro.renderer.lastFrameTime

                // Get acceleration needed
                ga.ax = (2 * (x1 - ga.x)) / Math.sqrt(t)
                ga.ay = (2 * (y1 - ga.y)) / Math.sqrt(t)

                // Get new position
                ga.x = ga.x + 0.5 * ga.ax * Math.sqrt(frameTime) 
                ga.y = ga.y + 0.5 * ga.ay * Math.sqrt(frameTime) 
            })
        }

        const trUpdateGraphics = tagpro.renderer.updateGraphics
        tagpro.renderer.updateGraphics = () => {
            trUpdateGraphics()
            tagpro.renderer.updateGrabAnimation()
        }

        // Debug spacebar flag animation
        // window.addEventListener("keydown", (e) => {
        //     if (e.code == 'Space') {
        //         let flag = { tile: 3, ...flagCoords.red}
        //         flag.x = flag.x * 40
        //         flag.y = flag.y * 40
        //         let texture = tagpro.tiles.getTexture(flag.tile)

        //         tagpro.renderer.addGrabAnimation(texture, flag.x, flag.y, tagpro.playerId,  performance.now() + 250)
                
        //     }
        // })

         // Watch someone getting flag
        tagpro.socket.on("p", (e) => {
            const playerUpdates = e.u || e;
            playerUpdates.forEach((update) => {
                // No flag update or flag dropped 
                if (!update.flag) return

                let flag = {}
                if (update.flag == 1) {
                    flag = { tile: 3, ...flagCoords.red}
                } else {
                    flag = { tile: 4, ...flagCoords.blue}
                }

                flag.x = flag.x * 40
                flag.y = flag.y * 40
                let texture = tagpro.tiles.getTexture(flag.tile)

                tagpro.renderer.addGrabAnimation(texture, flag.x, flag.y, update.id, performance.now() + 250)
            })
        })
    })
}


// Helper function to create pixi texture out of base644 encoded pngs
const base64ToTexture = (base64) => {
    const image = new Image()
    image.src = base64
    const baseTexture = new PIXI.BaseTexture(image)
    return new PIXI.Texture(baseTexture)
}

let tagproReadyResolve
let tagproReady = new Promise((resolve) => {
    tagproReadyResolve = resolve
})
let flagCoords = tagproReady
    .then(() => {
        return new Promise((resolve) => {
            tagpro.socket.on("map", (map) => {
                let red = null
                let blue = null
                let yellow = null
            
                for (const [x, mapTiles] of map.tiles.entries()) {
                    for (const [y, tileId] of mapTiles.entries()) {
                        if (tileId == 3 || tileId == "3.1") red = {x: x, y: y}
                        if (tileId == 4 || tileId == "4.1") blue = {x: x, y: y}
                        if (tileId == 16 || tileId == "16.1") yellow = {x: x, y: y}
            
                        if (yellow || red && blue) break
                    }
                    if (yellow || red && blue) break
                }
            
                resolve({'red': red, 'blue': blue, 'yellow': yellow})
            })
        })
    })

// Do fun things when ready
tagpro.ready(function() {
    // Only do this stuff in game
    if (!(window.location.port || window.location.href.includes('/game'))) return

    tagproReadyResolve()

    const allEffects = {
        trails: initTrails,
        kiss: initKiss,
        balloon: initBalloon,
        capConfetti: initCapConfetti,
        agressiveRb: initAgressiveRb,
        grabAnimation: initGrabAnimation
    }

    for (const effect in allEffects) {
        if (settings.get(effect)) allEffects[effect]()
    }
});

//To-do
// Add Color Code with Line 66
// Why are red balloon pops blue?
// Turn off particles on player disconnect
// Turn off particles on teleport
// Check random kiss code again (compare to other working random codes)
// Add Bonk Code
// Add Wall Code
// Zorro?
