import React, { useState, useEffect } from 'react'
import './App.css'
import { Container, Row, Col } from 'react-bootstrap'
import { io } from "socket.io-client"

function App() {
  const symbol = 'ETHBTC'
  const [depth, setDepth] = useState<any>({ bids: [], asks: [] })
  const [amountBid, setAmountBid] = useState<number>(0)
  const [sizeAsk, setSizeAsk] = useState<any>(0)
  const maxAmountBid = 5
  const maxSize = 150
  const url = `http://localhost:3001/api/depth?symbol=${symbol}&maxAmountBid=${maxAmountBid}&maxSizeAsk=${maxSize}`
  const socketUrl = 'ws://localhost:3001'

  const bidRender = depth.bids.map((bid, index) =>
    <Row key={index}>
      <Col sm={6}>{bid[1]}</Col>
      <Col className="buyPrice" sm={6}>{bid[0]}</Col>
    </Row>
  )

  const askRender = depth.asks.map((ask, index) =>
    <Row key={index}>
      <Col className="sellPrice" sm={6}>{ask[0]}</Col>
      <Col sm={6}>{ask[1]}</Col>
    </Row>
  )

  const loadData = async () => {
    const response = await fetch(url)
    const depthData = await response.json()
    if (!depthData.status) throw new Error(depthData.message)
    return depthData.data
  }

  const bindingData = (depth) => {
    const bids = depth.bids.length > 0 ? depth.bids.sort((a, b) => Number(a[0]) - Number(b[0])) : []
    const asks = depth.bids.length > 0 ? depth.bids.sort((a, b) => Number(b[0]) - Number(a[0])) : []

    if (bids.length > 0) {
      const amount = depth.bids.reduce((previous, current) => {
        const size = Number(current[1])
        const price = Number(current[0])
        return previous + size * price
      }, 0)
      setAmountBid(amount)
    }

    if (asks.length > 0) {
      const size = depth.asks.reduce((previous, current) => {
        return previous + Number(current[1])
      }, 0)
      setSizeAsk(size)
    }
    setDepth(depth)
  }

  useEffect(() => {
    const socket = io(socketUrl, { transports: ['websocket'] })
    socket.on("depth_fetch", data => {
      bindingData(data)
    })

    loadData()
      .then(depth => {
        bindingData(depth)
      })
      .catch(error => console.log(error.message))
  }, [])

  return (
    <div className="App">
      <Container>
        <Row>
          <Col className="depth" sm={5}>
            <Row className="depthHeader">
              <Col sm={6}>Size</Col>
              <Col sm={6}>Bid</Col>
            </Row>
            {bidRender}
            <Row className="summary">
              <Col>Amount Bid: {amountBid.toFixed(2)}</Col>
            </Row>
          </Col>
          <Col sm={2}></Col>
          <Col className="depth" sm={5}>
            <Row className="depthHeader">
              <Col sm={6}>Ask</Col>
              <Col sm={6}>Size</Col>
            </Row>
            {askRender}
            <Row></Row>
            <Row className="summary">
              <Col>Size Ask: {sizeAsk.toFixed(2)}</Col>
            </Row>
          </Col>
        </Row>

      </Container>
    </div>
  )
}

export default App
