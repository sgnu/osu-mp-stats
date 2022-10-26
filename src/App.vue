<script>
import GameResults from './components/GameResults.vue'
import { exampleGame, examplePlayers } from './exampleData'
import { apiCall } from './util/apiCall'

export default {
  name: 'App',
  components: {
    GameResults
  },
  data() {
    return {
      game: exampleGame,
      players: examplePlayers,
      fetchQueue: [],
    }
  },
  created() {
    // this.getUniquePlayers()
  },
  methods: {
    getUniquePlayers() {
      const tempArray = []

      exampleGame.games.forEach(game => {
        game.scores.forEach(score => {
          if (tempArray.indexOf(score.user_id) === -1) {
            tempArray.push(score.user_id)
          }
        })
      })

      tempArray.forEach((id, index) => {
        this.fetchQueue.push(`get_user-${id}`)
        setTimeout(this.addPlayer, 50 * index, id)
      })
    },
    async addPlayer(id) {
      const params = { 'type': 'id', 'u': id }
      this.players[id] = (await apiCall('get_user', params))[0]

      const index = this.fetchQueue.indexOf(`get_user-${id}`)
      if (index > -1) {
        this.fetchQueue.splice(index, 1)
      }
    }
  },
  computed: {
    isLoading() {
      return this.fetchQueue.length !== 0
    }
  }
}
</script>

<template>
  <h1>{{game.match.name}}</h1>
  <h1 v-if="isLoading">Loading...</h1>
  <p>All players: <span v-for="player in players">{{player.username}} </span></p>
  <GameResults :game-info="game.games[0]" />
</template>

<style scoped>
</style>
