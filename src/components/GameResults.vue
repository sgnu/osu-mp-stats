<script>
export default {
    name: 'GameResults',
    props: {
        gameInfo: Object
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
    }
}
</script>

<template>
    <div>
        <div v-for="score in teamOne">
            <p>{{score.user_id}}</p>
        </div>
    </div>
</template>

<style scoped>

</style>