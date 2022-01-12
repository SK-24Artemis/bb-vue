import { deleteGlobal, setGlobal } from '/bb-vue/lib.js'
import MittLoader from '/bb-vue/MittLoader.js'
import Collector from '/nuwave/collector.js'
import Eye from '/nuwave/eye.js'
import Scheduler from '/nuwave/scheduler.js'
import Store from '/nuwave/store.js'

export async function main(ns) {
  const nu = setGlobal('nuMain', { wantsShutdown: false, ns })

  await initAll(nu)
  nu.bus.on('nu:shutdown', () => (nu.wantsShutdown = true))

  let tick = 0
  const rate = 200
  while (nu.wantsShutdown === false) {
    nu.scheduler.checkHealth(tick)
    await ns.asleep(rate * 0.5)
    nu.collector.collect(tick)
    await ns.asleep(rate * 0.5)
    tick += rate
  }

  ns.tprint(`🛑 received shutdown notice, exiting...`)
  deleteGlobal('nuMain')
  ns.exit()
}

async function initAll(nu) {
  nu.bus = (await MittLoader.Get()).createBus()
  nu.ns.tprint(`🚌 nuBus booted`)

  nu.store = await storeInit(nu)
  nu.ns.tprint(`📦 nuStore booted`)

  nu.scheduler = await schedulerInit(nu)
  nu.ns.tprint(`⏰ nuScheduler booted`)

  nu.collector = await collectorInit(nu)
  nu.ns.tprint(`🧰 nuCollector booted`)

  nu.eye = await eyeInit(nu)
  nu.ns.tprint(`🧿 nuEye booted`)
}

async function storeInit(nu) {
  const store = new Store(nu.ns)
  store.init({
    player: {},
    srv: {},
    proc: {},
  })
  return store
}

async function schedulerInit(nu) {
  const scheduler = new Scheduler(nu.ns)
  await scheduler.init()
  return scheduler
}

async function collectorInit(nu) {
  const collector = new Collector(nu.ns)
  return collector
}

async function eyeInit(nu) {
  const eye = new Eye(nu.ns)
  await eye.init()
  return eye
}
