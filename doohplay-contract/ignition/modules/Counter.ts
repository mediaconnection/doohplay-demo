type IgnitionModulePlaceholder = {
  name: string
  disabled: true
  reason: string
}

const CounterModule: IgnitionModulePlaceholder = {
  name: "CounterModule",
  disabled: true,
  reason:
    "Hardhat Ignition is not installed in this Next.js build environment. This placeholder prevents Next.js TypeScript build from importing @nomicfoundation/hardhat-ignition/modules."
}

export default CounterModule