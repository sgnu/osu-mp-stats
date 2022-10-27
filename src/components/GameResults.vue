<script>
export default {
    name: 'GameResults',
    props: {
        gameInfo: Object,
        players: Object
    },
    data() {
        return {
            teamOne: [],
            teamTwo: []
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
    <div>
        <div class="beatmap">{{ gameInfo.beatmap_id }}</div>
        <div class="team-container">
            <div class="team team-one">
                <div v-for="score in teamOne">
                    <h1>{{ players[score.user_id].username }} <span>{{ formatScore(score.score) }}</span></h1>
                    <p>{{ score.maxcombo }}x max combo - {{ calculateAccuracy(score) }}%</p>
                    <p>{ {{ score.count300 }} / {{ score.count100 }} / {{ score.count50 }} / {{ score.countmiss }} }</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.beatmap {
    color: var(--ctp-mocha-text);
    width: 100%;
    text-align: center;
}

.team-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.team-one h1 {
    color: var(--ctp-mocha-blue);
}

.team-two h1 {
    color: var(--ctp-mocha-red);
}

h1 {
    margin: 0;
}

h1>span {
    color: var(--ctp-mocha-text);
    font-weight: 400;
    font-size: 18px;
}

p {
    color: var(--ctp-mocha-subtext0);
    margin: 0;
}

@media screen and (max-width: 1080px) {
    .team-container {
        display: flex;
        flex-direction: column;
    }

    .team {
        margin-bottom: 24px;
    }
}
</style>