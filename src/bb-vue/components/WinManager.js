// prettier-ignore
import { lodash } from '/bb-vue/lib.js'

export default {
  name: 'bbv-win-manager',
  inject: ['internals'],
  template: `<!-- __CMP_NAME__ -->`,
  data() {
    return {
      baseStackingIndex: 1510,
    }
  },
  created() {
    this.internals.winManager = this
  },
  methods: {
    addWin(winMount) {
      this.internals.store.winMounts.push(winMount)
    },
    removeWin(winMount) {
      this.internals.store.winMounts = this.internals.store.winMounts.filter((x) => {
        return x.uuid != winMount.uuid
      })
    },
    getRecommendedPosition(winMountStore) {
      const rootOffset = { x: 310, y: 55 }
      const standardOffset = { x: 20, y: 45 }
      let curOffset = standardOffset
      let targetWinMount = lodash.findLast(
        this.internals.store.winMounts,
        (x) => x.draggable?.wasOffsetByWinManager
      )
      if (!targetWinMount) {
        this.internals.store.winMounts.forEach((winMount) => {
          let width = parseInt(winMount?.style?.width ?? 0)
          let height = parseInt(winMount?.style?.height ?? 0)
          let largestWidth = parseInt(targetWinMount?.style?.width ?? 0)
          let largestHeight = parseInt(targetWinMount?.style?.height ?? 0)
          if (width > largestWidth && height > largestHeight) {
            curOffset = rootOffset
            targetWinMount = winMount
            winMountStore.wasOffsetByWinManager = true
          }
        })
        if (!targetWinMount) return rootOffset
      } else {
        winMountStore.wasOffsetByWinManager = true
      }
      return {
        x: parseInt(targetWinMount.style.left) + curOffset.x,
        y: parseInt(targetWinMount.style.top) + curOffset.y,
      }
    },
    bringToFront(winMount) {
      let otherWins = this.internals.store.winMounts.filter((x) => winMount.uuid != x.uuid)
      winMount.stackingIndex = this.baseStackingIndex + otherWins.length
      let sortedOtherWins = [...otherWins].sort((a, b) => a.stackingIndex - b.stackingIndex)
      sortedOtherWins.forEach((x, i) => (x.stackingIndex = this.baseStackingIndex + i))
    },
    async closeAllWinsByCrmUuid(crmUuid) {
      return new Promise((resolve) => {
        this.internals.store.winMounts.forEach((winMount) => {
          if (winMount.owner.$options.__uuid == crmUuid) {
            winMount.close()
          }
        })
        setTimeout(() => {
          resolve()
        }, 500)
      })
    },
  },
}
