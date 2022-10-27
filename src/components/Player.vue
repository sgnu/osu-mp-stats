<script>
export default {
    name: 'Player',
    props: {
        player: Object
    },
    computed: {
        getMatchCost() {
            return this.player.matchCost.toLocaleString(undefined, { minimumFractionDigits: 3 })
        },

        getRank() {
            return new Intl.NumberFormat(undefined, { useGrouping: 'always'}).format(this.player.pp_rank)
        }
    }
}
</script>

<template>
    <div>
        <img class="profile-picture" :src="`https://s.ppy.sh/a/${player.user_id}`"/>
        <h1>{{ player.username }} #{{ getRank }}</h1>
        <div class="break"></div>
        <p v-if="player.matchCost">{{ getMatchCost }} match cost</p>
        <!-- {{ player.team }} -->
    </div>
</template>

<style scoped>

div {
    display: flex;
    flex-wrap: wrap;
}

img.profile-picture {
    width: 32px;
    height: 32px;
    margin-right: 16px;
}

.break {
    flex-basis: 100%;
    height: 0;
}

h1 {
    color: var(--ctp-mocha-text);
    font-size: 24px;
    line-height: 32px;

    margin: 0;
}

p {
    color: var(--ctp-mocha-subtext0);

    margin: 0;
}
</style>