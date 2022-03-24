import React, {useState, useEffect} from 'react';
import './App.css';
import {Container, Row, Col} from 'react-bootstrap';
function App() {
  const symbol = 'ETHBTC'
  const limit = 5
  const [depth, setDepth] = useState<any>({bids: [], asks: []})
  const [amountBid, setAmountBid] = useState<number>(0)
  const [sizeAsk, setSizeAsk] = useState<any>(0)
  const maxAmountBid = 5
  const maxSize = 150
  const url = `http://localhost:3001/api/depth?symbol=${symbol}&maxAmountBid=${maxAmountBid}&maxSize=${maxSize}`

  const bidRender = depth.bids.map((bid, index) =>
    <Row key={index}>
      <Col sm={6}>{bid[1]}</Col>
      <Col sm={6}>{bid[0]}</Col>
    </Row>
  )

  const askRender = depth.asks.map((ask, index) =>
    <Row key={index}>
      <Col sm={6}>{ask[0]}</Col>
      <Col sm={6}>{ask[1]}</Col>
    </Row>
  )

  const loadData = async () => {
    const response = await fetch(url)
    const depthData = await response.json()
    if (!depthData.status) throw new Error(depthData.message)
    return depthData.data
  }

  useEffect(()=> {
    loadData()
      .then(depth => {
        if (depth.bids.length > 0) {
          const amount = depth.bids.reduce((previous, current) => {
            const size = Number(current[1])
            const price = Number(current[0])
            return previous + size * price
          }, 0)
          setAmountBid(amount)
        }

        if (depth.asks.length > 0) {
          const size = depth.asks.reduce((previous, current) => {
            return previous + Number(current[1])
          }, 0) 
          setSizeAsk(size)
        }
        setDepth(depth)
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
  );
}

export default App;
