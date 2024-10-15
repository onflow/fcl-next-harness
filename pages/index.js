import * as fcl from "@onflow/fcl"
import { useState, useEffect, useRef } from "react"
import "../flow/config"
import { COMMANDS } from "../cmds"
import useCurrentUser from "../hooks/use-current-user"
import useConfig from "../hooks/use-config"
import Loading from "./loading"
import Image from "next/image"
import "../flow/config"

export default function Home() {
  const currentUser = useCurrentUser()
  const config = useConfig()
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const discoveryWalletInputRef = useRef(null)

  const renderCommand = d => {
    return (
      <li key={d.LABEL}>
        <button onClick={() => clickHandler(d.CMD)}>{d.LABEL}</button>
      </li>
    )
  }

  async function clickHandler(fn, args = null) {
    setIsLoading(true)
    await fn(args)
    setIsLoading(false)
  }

  useEffect(() => {
    const fetchServices = async () =>
      await fcl.discovery.authn.subscribe(res => {
        setServices(res.results)
      })
    if (config && config["discovery.authn.endpoint"]) fetchServices()
  }, [config])

  useEffect(() => {
    require("../decorate")
  }, [])

  return (
    <div>
      <ul>{COMMANDS.map(cmd => renderCommand(cmd))}</ul>
      <div>
        {services?.map(service => (
          <span key={service.provider.address}>
            <Image
              src={service.provider.icon}
              alt="Wallet Icon"
              width={25}
              height={25}
            />
            <button onClick={() => clickHandler(fcl.authenticate, { service })}>
              Login with {service.provider.name}
            </button>
          </span>
        ))}
      </div>
      <div style={{ marginTop: "12px" }}>
        <label htmlFor="manual-wallet">
          {'Manually set "discovery.wallet" config:'}
        </label>
        <input ref={discoveryWalletInputRef} name="manual-wallet"></input>
        <button
          onClick={() =>
            fcl
              .config()
              .put("discovery.wallet", discoveryWalletInputRef?.current?.value)
          }
        >
          Set
        </button>
      </div>
      <pre>{JSON.stringify({ currentUser, config }, null, 2)}</pre>
      {isLoading ? <Loading /> : null}
    </div>
  )
}
