<script>
import GameResults from './components/GameResults.vue'
import Player from './components/Player.vue'
import { exampleGame, examplePlayers, exampleBeatmaps } from './exampleData'
import { apiCall } from './util/apiCall'

export default {
  name: 'App',
  components: {
    GameResults,
    Player
  },
  data() {
    return {
      game: exampleGame,
      players: examplePlayers,
      beatmaps: exampleBeatmaps,
      teamOne: [],
      teamTwo: [],
      fetchQueue: [],
    }
  },
  created() {
    // this.getUniquePlayers()
    // this.getBeatmapsInfo()
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

    getBeatmapsInfo() {
      const tempArray = []

      this.game.games.forEach(game => {
        if (tempArray.indexOf(game.beatmap_id) === -1) {
          tempArray.push({
            beatmapId: game.beatmap_id,
            mods: game.mods
          })
        }
      })

      tempArray.forEach((map, index) => {
        this.fetchQueue.push(`get_beatmap-${map.beatmapId}`)
        setTimeout(this.getBeatmap, 50 * index, map.beatmapId, map.mods)
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
            this.players[score.user_id].team = score.team
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
        this.players[player.user_id].gamesPlayed = player.gamesPlayed
      })

      this.sortTeams()
    },

    sortTeams() {
      Object.values(this.players).forEach(player => {
        if (player.team === '1') {
          this.teamOne.push(player)
        } else {
          this.teamTwo.push(player)
        }
      })

      // sort players on team by match cost (descending)
      this.teamOne.sort((a, b) => {
        return b.matchCost - a.matchCost
      })

      this.teamTwo.sort((a, b) => {
        return b.matchCost - a.matchCost
      })
    },

    async getBeatmap(beatmapId, mods) {
      const params = { 'b': beatmapId }
      const res = await apiCall('get_beatmaps', params)
      res[0]["mods"] = mods

      this.beatmaps[beatmapId] = res[0]


      const index = this.fetchQueue.indexOf(`get_beatmap-${beatmapId}`)
      if (index > -1) {
        this.fetchQueue.splice(index, 1)
      }
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
  <h1 v-if="isLoading">Loading...</h1>
  <div class="app" v-else>
    <h1>{{ game.match.name }}</h1>
    <div class="team">
      <Player v-for="player in teamOne" :player="player" />
    </div>
    <div class="team">
      <Player v-for="player in teamTwo" :player="player" />
    </div>

    <div class="games">
      <GameResults v-for="gameResult in game.games" :game-info="gameResult" :players="players" :beatmaps="beatmaps" />
    </div>
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.team {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-two {
  text-decoration: underline;
}

.games {
  grid-column: 1 / span 2;
}

h1 {
  color: var(--ctp-mocha-text);
  grid-column: 1 / span 2;
}

p {
  color: var(--ctp-mocha-subtext1)
}

@media screen and (max-width: 1080px) {
  .app {
    display: flex;
    flex-direction: column;
  }

  .team {
    margin-bottom: 24px;
  }
}
</style>
