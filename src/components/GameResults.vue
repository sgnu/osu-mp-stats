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
            if (score.team === '1') {
                this.teamOne.push(score)
            } else {
                this.teamTwo.push(score)
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

            return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(accuracy)
        }
    }
}
</script>

<template>
    <div class="game-container">
        <div class="beatmap-header" :style="{'background-image': `url(https://assets.ppy.sh/beatmaps/${beatmapInfo.beatmapset_id}/covers/cover.jpg)`}"></div>
        <a class="beatmap" :href="`https://osu.ppy.sh/b/${beatmapInfo.beatmap_id}`">{{ beatmapInfo.artist }} - {{ beatmapInfo.title }} [{{ beatmapInfo.version }}]</a>
        <div class="teams-container">
            <div class="team team-one">
                <div v-for="score in teamOne">
                    <h1>{{ players[score.user_id].username }} <span>{{ formatScore(score.score) }}</span></h1>
                    <p>{{ score.maxcombo }}x max combo - {{ calculateAccuracy(score) }}%</p>
                    <p>{ {{ score.count300 }} / {{ score.count100 }} / {{ score.count50 }} / {{ score.countmiss }} }</p>
                </div>
            </div>
            <div class="team team-two">
                <div v-for="score in teamTwo">
                    <h1>{{ players[score.user_id].username }} <span>{{ formatScore(score.score) }}</span></h1>
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

a.beatmap {
    text-decoration: none;
    color: var(--ctp-mocha-text);
    font-size: 16px;

    position: relative;
    top: -32px;
    left: 12px;
}

.teams-container {
    display: grid;
    grid-template-columns: 1fr 1fr;

    padding: 16px;
}

.team-one h1 {
    color: var(--ctp-mocha-blue);
}

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
    color: var(--ctp-mocha-subtext0);
    margin: 0;
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