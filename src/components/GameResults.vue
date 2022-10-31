<script>
export default {
    name: 'GameResults',
    props: {
        gameInfo: Object,
        players: Object,
        beatmaps: Object
    },
    data() {
        return {
            teamOne: [],
            teamTwo: [],
            beatmapInfo: {},
        }
    },
    created() {
        this.gameInfo.scores.forEach(score => {
            if (score.team === '1') {   // team 1 is red, team 2 is blue
                this.teamTwo.push(score)
            } else {
                this.teamOne.push(score)
            }
        })

        // sort teams by score (descending)
        this.teamOne.sort((a, b) => {
            return b.score - a.score
        })

        this.teamTwo.sort((a, b) => {
            return b.score - a.score
        })

        this.beatmapInfo = this.beatmaps[this.gameInfo.beatmap_id]
    },
    methods: {
        formatScore(score) {
            return new Intl.NumberFormat(undefined, { useGrouping: true }).format(score)
        },

        calculateAccuracy(score) {
            // hit counts are stored as strings in the api
            const hits = [
                parseInt(score.count300),
                parseInt(score.count100),
                parseInt(score.count50),
                parseInt(score.countmiss)
            ]
            const totalHits = hits[0] + hits[1] + hits[2] + hits[3]
            const accuracy = 100 * ((hits[0] * 300) + (hits[1] * 100) + (hits[2] * 50)) / (totalHits * 300)

            return this.get2Decimals(accuracy)
        },

        get1Decimals(number) {
            return new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1}).format(number)
        },

        get2Decimals(number) {
            return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2}).format(number)
        },

        totalScore(team) {
            let total = 0
            team.forEach(score => {
                total += parseInt(score.score)
            })
            return this.formatScore(total)
        }
    },
    computed: {
        bpm() {
            if (this.beatmapInfo.mods & 64) {   // double time
                return this.beatmapInfo.bpm * 1.5
            } else {
                return this.beatmapInfo.bpm
            }
        },

        starRating() {
            return this.get2Decimals(this.beatmapInfo.difficultyrating)
        },

        overall() {
            if (this.beatmapInfo.mods & 16) {   // hard rock
                return this.get1Decimals(Math.min(this.beatmapInfo.diff_overall * 1.4, 10))
            } else if (this.beatmapInfo.mods & 64) {    // double time
                let perfectWindow = 80 - (6 *  this.beatmapInfo.diff_overall)
                perfectWindow = perfectWindow / 1.5
                return this.get1Decimals((80 - perfectWindow) / 6)
            } else {
                return this.get1Decimals(this.beatmapInfo.diff_overall)
            }
        },

        approach() {
            const approachRate = this.beatmapInfo.diff_approach
            if (this.beatmapInfo.mods & 16) {   // hard rock
                return this.get1Decimals(Math.min(approachRate * 1.4, 10))
            } else if (this.beatmapInfo.mods & 64) {
                let approachTime, newAr
                if (approachRate < 5) {
                    approachTime = 1200 + 600 * (5 - approachRate) / 5
                } else if (approachRate > 5) {
                    approachTime = 1200 - 750 * (approachRate - 5) / 5
                } else {
                    approachTime = 1200
                }

                approachTime = approachTime / 1.5
                if (approachTime > 1200) {
                    newAr = 15 - (5 * approachTime / 600)
                } else if (approachTime < 1200) {
                    newAr = ((6000 - 5 * approachTime) / 750) + 5
                } else {
                    newAr = 5
                }

                return this.get1Decimals(newAr)
            } else {
                return this.get1Decimals(approachRate)
            }
        },

        size() {
            if (this.beatmapInfo.mods & 16) {   // hard rock
                return this.get1Decimals(Math.min(this.beatmapInfo.diff_size * 1.3, 10))
            } else {
                return this.beatmapInfo.diff_size
            }
        },

        enabledMods() {
            const mod = this.beatmapInfo.mods
            if (mod & 8) {   // hidden
                return '+HD'
            } else if (mod & 16) {  // hard rock
                return '+HR'
            } else if (mod & 64) {  // double time
                return '+DT'
            }
        }
    }
}
</script>

<template>
    <div class="game-container">
        <div class="beatmap-header" :style="{'background-image': `url(https://assets.ppy.sh/beatmaps/${beatmapInfo.beatmapset_id}/covers/cover.jpg)`}"></div>
        <a class="beatmap" :href="`https://osu.ppy.sh/b/${beatmapInfo.beatmap_id}`">{{ beatmapInfo.artist }} - {{ beatmapInfo.title }} [{{ beatmapInfo.version }}] {{ enabledMods }}</a>
        <p class="beatmap-stats">{{ starRating }}★ {{ bpm }}bpm / CS{{ size }} / OD{{ overall }} / AR{{ approach }}</p>
        <div class="teams-container">
            <div class="team team-one">
                <h2 class="total">{{ totalScore(teamOne) }}</h2>
                <div v-for="score in teamOne">
                    <h1><span>{{ formatScore(score.score) }}</span> <a :href="`https://osu.ppy.sh/u/${score.user_id}`">{{ players[score.user_id].username }}</a></h1>
                    <p>{{ score.maxcombo }}x max combo - {{ calculateAccuracy(score) }}%</p>
                    <p>{ {{ score.count300 }} / {{ score.count100 }} / {{ score.count50 }} / {{ score.countmiss }} }</p>
                </div>
            </div>
            <div class="team team-two">
                <h2 class="total">{{ totalScore(teamTwo) }}</h2>
                <div v-for="score in teamTwo">
                    <h1><a :href="`https://osu.ppy.sh/u/${score.user_id}`">{{ players[score.user_id].username }}</a> <span>{{ formatScore(score.score) }}</span></h1>
                    <p>{{ score.maxcombo }}x max combo - {{ calculateAccuracy(score) }}%</p>
                    <p>{ {{ score.count300 }} / {{ score.count100 }} / {{ score.count50 }} / {{ score.countmiss }} }</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.game-container {
    background: var(--ctp-mocha-base);
    border-radius: 12px;

    width: 100%;
    height: auto;
}

.beatmap-header {
    background-size: cover;
    background-position: center;
    border-radius: 12px;

    margin-top: 24px;
    width: 100%;
    height: 192px;
    filter: brightness(0.33);
}

a {
    text-decoration: none;
}

a.beatmap {
    color: var(--ctp-mocha-text);
    font-size: 16px;

    position: relative;
    top: -32px;
    left: 12px;
}

p.beatmap-stats {
    color: var(--ctp-mocha-subtext0);
    text-align: center;
}

.teams-container {
    display: grid;
    grid-template-columns: 1fr 1fr;

    padding: 16px;
}

.team-one a,
.team-one h1 {
    color: var(--ctp-mocha-blue);
}

.team-two a,
.team-two h1 {
    color: var(--ctp-mocha-red);
}

.team-two {
    text-align: right;
}

h1 {
    margin: 0;
}

h1>span {
    color: var(--ctp-mocha-text);
    font-weight: 400;
    font-size: 28px;
}

p {
    color: var(--ctp-mocha-overlay2);
    margin: 0;
}

h2 {
    font-size: 32px;
    margin: 0;
    padding-bottom: 16px;
}

.team-one h2 {
    color: var(--ctp-mocha-blue);
}

.team-two h2 {
    color: var(--ctp-mocha-red);
    text-align: right;
}

@media screen and (max-width: 1080px) {
    .teams-container {
        display: flex;
        flex-direction: column;
    }

    .team {
        margin-bottom: 24px;
    }

    .team-two {
        text-align: left;
    }
}
</style>