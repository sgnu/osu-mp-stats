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
    this.calculateMatchCosts()
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

    calculateMatchCosts() { // calculate using osuPlus's formula: https://i.imgur.com/BJPOKDY.png
      const tempPlayers = {}
      Object.values(this.players).forEach(player => {
        tempPlayers[player.user_id] = {
          user_id: player.user_id,
          gameSum: 0,
          gamesPlayed: 0
        }
      })

      // parse through all played games
      this.game.games.forEach(game => {
        // get average score; account for in-match referees getting 0 score
        const players = {}
        let totalScore = 0
        let count = 0
        game.scores.forEach(score => {
          const points = parseInt(score.score)
          if (points !== 0) {
            totalScore += points
            count++
            players[score.user_id] = {
              user_id: score.user_id,
              score: points,
            }
          }
        })

        const average = totalScore / count
        Object.values(players).forEach(player => {
          tempPlayers[player.user_id].gameSum += player.score / average
          tempPlayers[player.user_id].gamesPlayed++
        })
      })

      Object.values(tempPlayers).forEach(player => {
        this.players[player.user_id].matchCost = (player.gameSum * (2 / (player.gamesPlayed + 2)))
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
  <p v-for="player in players">{{player.username}} <span v-if="player.matchCost">- {{player.matchCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}}</span></p>
  <GameResults :game-info="game.games[0]" />
</template>

<style scoped>
</style>
