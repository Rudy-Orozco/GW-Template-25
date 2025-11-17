import { useState, useRef, useEffect } from "react"

// Dynamically import all images from src/assets/characters
const characterImages = import.meta.glob('./assets/characters/*.{png,jpg,jpeg,webp}', { eager: true })

function App() {
  const characters = Object.keys(characterImages).map((path) => {
    const name = path.split('/').pop().replace(/\.(png|jpg|jpeg|webp)$/i, '')
    const img = characterImages[path].default
    return { name, img }
  })

  const [cardStates, setCardStates] = useState(
    characters.reduce((acc, char) => {
      acc[char.name] = 'normal'
      return acc
    }, {})
  )
  const [favoriteCard, setFavoriteCard] = useState(null)
  const [showHowTo, setShowHowTo] = useState(false)
  const [favoriteMode, setFavoriteMode] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdInterval = useRef(null)

  // Modal states
  const [modalImage, setModalImage] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const toggleCardState = (name) => {
    if (favoriteMode) {
      setFavoriteCard(name)
      setFavoriteMode(false)
      return
    }

    setCardStates((prev) => {
      const nextState =
        prev[name] === 'normal' ? 'red' : prev[name] === 'red' ? 'green' : 'normal'
      return { ...prev, [name]: nextState }
    })
  }

  const clearBoard = () => {
    setCardStates(
      characters.reduce((acc, char) => {
        acc[char.name] = 'normal'
        return acc
      }, {})
    )
    setFavoriteCard(null)
    setFavoriteMode(false)
  }

  const startHold = () => {
    const startTime = Date.now()
    const duration = 1000
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setHoldProgress(progress * 100)
      if (progress >= 1) {
        clearInterval(holdInterval.current)
        setHoldProgress(0)
        clearBoard()
      }
    }, 50)
  }

  const endHold = () => {
    clearInterval(holdInterval.current)
    setHoldProgress(0)
  }

  const getBgClass = (state, name) => {
    if (name === favoriteCard) return 'bg-yellow-500'
    if (favoriteMode && name !== favoriteCard) return 'hover:bg-yellow-200/40'
    if (state === 'red') return 'bg-red-500'
    if (state === 'green') return 'bg-green-600'
    return 'bg-white/20'
  }

  const getOverlay = (state) => {
    if (state === 'red')
      return (
        <span
          className="absolute text-9xl font-bold pointer-events-none select-none"
          style={{
            color: '#ff4d4d',
            textShadow: `
              -2px -2px 0 #ffffff,
              2px -2px 0 #ffffff,
              -2px  2px 0 #ffffff,
              2px  2px 0 #ffffff
            `,
          }}
        >
          ×
        </span>
      )
    if (state === 'green')
      return (
        <span
          className="absolute text-8xl font-bold pointer-events-none select-none"
          style={{
            color: '#00ff00',
            textShadow: `
              -2px -2px 0 #ffffff,
              2px -2px 0 #ffffff,
              -2px  2px 0 #ffffff,
              2px  2px 0 #ffffff
            `,
          }}
        >
          ◯
        </span>
      )
    return null
  }

  // Animate modal removal
  useEffect(() => {
    if (!modalVisible && modalImage) {
      const timer = setTimeout(() => setModalImage(null), 300)
      return () => clearTimeout(timer)
    }
  }, [modalVisible])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black to-gray-700"></div>

      {/* Top bar */}
      <div className="w-full max-w-[1450px] flex justify-between items-center z-10 mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-white">| GUESS THE VTUBER |</h1>
          <h1 className="text-white text-xs mb-2">Version 11.17</h1>
          <h1 className="text-white">By Lia Nwe</h1>
          <h1 className="text-white mb-2">Developed by REKAA_85</h1>
        </div>

        <div className="flex space-x-2">
          {/* Hold-to-clear button */}
          <div className="relative w-32">
            <button
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700 transition relative overflow-hidden"
            >
              Clear Board
              <div
                className="absolute top-0 left-0 h-full bg-red-400/50 pointer-events-none transition-all"
                style={{ width: `${holdProgress}%` }}
              ></div>
            </button>
          </div>

          <button
            onClick={() => setFavoriteMode(!favoriteMode)}
            className={`px-4 py-2 font-semibold rounded shadow transition ${
              favoriteMode ? 'bg-yellow-500 text-black' : 'bg-yellow-400 text-black hover:bg-yellow-500'
            }`}
          >
            Set Favorite
          </button>

          <button
            onClick={() => setShowHowTo(true)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700 transition"
          >
            How to Play
          </button>
        </div>
      </div>

      {/* Favorite Card Display */}
      <div className="w-full max-w-[1450px] flex justify-center items-center z-10 mb-4">
        <h2 className="text-3xl font-semibold text-white mb-5">
          Your Vtuber is: <span className="text-yellow-400">{favoriteCard || "None"}</span>
        </h2>
      </div>

      {/* Grid of cards */}
      <div className="inline-grid grid-cols-5 gap-6 justify-center z-10">
        {characters.map((char) => (
          <div
            key={char.name}
            onClick={() => toggleCardState(char.name)}
            className={`group relative p-4 rounded-xl flex flex-col items-center cursor-pointer hover:scale-105 transform transition select-none border border-white/20 backdrop-blur-md shadow-lg ${
              getBgClass(cardStates[char.name], char.name)
            }`}
          >
            {/* Favorite star */}
            {favoriteCard === char.name && (
              <span className="absolute top-2 right-2 text-2xl text-yellow-400 drop-shadow-lg z-20">
                ⭐
              </span>
            )}

            {/* Magnifying glass button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setModalImage(char.img) // mount first
                setTimeout(() => setModalVisible(true), 10) // trigger animation next tick
              }}
              className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-black bg-opacity-60 text-white text-sm rounded-full hover:bg-opacity-80 transition leading-none z-20"
            >
              🔍
            </button>


            {/* Image */}
            <div className={`relative w-36 h-36 mb-2 flex items-center justify-center rounded-lg overflow-hidden bg-white/10`}>
              <img src={char.img} alt={char.name} className="max-w-full max-h-full object-contain select-none" />
              {getOverlay(cardStates[char.name])}
            </div>

            {/* Title Box */}
            <div className="bg-black bg-opacity-60 px-2 py-1 rounded">
              <p className="font-semibold text-white">{char.name}</p>
            </div>

            {/* RIGHT-SIDE BOOK TABS (appear on hover) */}
            <div className="absolute top-0 right-0 flex flex-col h-full justify-center space-y-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCardStates((prev) => ({ ...prev, [char.name]: "red" }))
                }}
                className="w-6 h-12 bg-red-500 text-white font-bold rounded-l hover:bg-red-600 transition text-sm pointer-events-auto"
              >
                X
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCardStates((prev) => ({ ...prev, [char.name]: "green" }))
                }}
                className="w-6 h-12 bg-green-500 text-white font-bold rounded-l hover:bg-green-600 transition text-sm pointer-events-auto"
              >
                O
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCardStates((prev) => ({ ...prev, [char.name]: "normal" }))
                }}
                className="w-6 h-12 bg-blue-300 text-blue-900 font-bold rounded-l hover:bg-blue-400 transition text-sm pointer-events-auto"
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>

        {/* Fullscreen animated modal viewer */}
        {modalImage && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
              modalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setModalVisible(false)}
            style={{ cursor: 'default', userSelect: 'none' }} // <- prevents blinking text cursor
          >
            <div
              className={`bg-white p-4 rounded-lg shadow-xl max-w-screen-md max-h-[90vh] flex flex-col items-center transform transition-transform duration-300 ${
                modalVisible ? 'scale-100' : 'scale-75'
              }`}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'default', userSelect: 'none' }} // <- prevents selection
            >
              <img
                src={modalImage}
                alt="Full size"
                className="object-contain max-w-full max-h-[80vh] select-none"
                style={{ cursor: 'default', userSelect: 'none' }} // <- prevents blinking cursor over image
              />
              <button
                className="mt-4 w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={() => setModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}


        {/* How to Play Modal */}
        {showHowTo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHowTo(false)}
            style={{ cursor: 'default', userSelect: 'none' }}
          >
            <div
              className="bg-gray-900 text-white p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6 text-yellow-400 text-center">How to Play</h2>
              <ol className="list-decimal list-inside space-y-4 text-lg">
                <li>
                  <span className="font-semibold">Click a card:</span> Cycles its state → Normal → X (red) → O (green) → Normal.
                </li>
                <li>
                  <span className="font-semibold">Quick-action tabs:</span> Hover over a card to see X, O, or - buttons for instant state changes.
                </li>
                <li>
                  <span className="font-semibold">View larger image:</span> Click the magnifying glass 🔍 to open a full-size preview.
                </li>
                <li>
                  <span className="font-semibold">Set Favorite:</span> Click "Set Favorite" to activate favorite mode, then click a card to mark it as favorite.
                </li>
                <li>
                  <span className="font-semibold">Clear Board:</span> Hold the "Clear Board" button for 3 seconds to reset all cards and remove your favorite card.
                </li>
              </ol>
              <button
                className="mt-6 w-full py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-600 transition-all"
                onClick={() => setShowHowTo(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        )}

      {/* Footer */}
      <footer className="w-full mt-8 text-center text-white text-sm opacity-70 space-y-1">
        <div>© 2025 REKAA_85. All rights reserved for the original code, web design, and modifications.</div>
        <div>Third-party assets including artwork are used with permission from their respective owners/creators and remain the property of their original owners/creators.</div>
        <div>No part of this project may be reproduced, distributed, or modified without explicit authorization. AI training is strictly forbidden.</div>
      </footer>

    </div>
  )
}

export default App
