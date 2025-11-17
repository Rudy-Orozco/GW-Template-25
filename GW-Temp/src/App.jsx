import { useState } from "react"

// Dynamically import all images from src/assets/characters (supports multiple formats)
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

  const toggleCardState = (name) => {
    setCardStates((prev) => {
      const nextState =
        prev[name] === 'normal' ? 'red' : prev[name] === 'red' ? 'green' : 'normal'
      return { ...prev, [name]: nextState }
    })
  }

  const getBgClass = (state) => {
    if (state === 'red') return 'bg-red-500'
    if (state === 'green') return 'bg-green-500'
    return 'bg-white'
  }

  const getOverlay = (state) => {
    if (state === 'red')
      return (
        <span className="absolute text-8xl font-bold text-red-700 pointer-events-none select-none">
          ×
        </span>
      )
    if (state === 'green')
      return (
        <span className="absolute text-9xl font-bold text-green-700 pointer-events-none select-none">
          ∘
        </span>
      )
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Guess Who Board</h1>

      {/* Grid limited to 5 cards per row */}
      <div className="inline-grid grid-cols-5 gap-6 justify-center">
        {characters.map((char) => (
          <div
            key={char.name}
            className={`p-4 rounded-lg shadow-lg flex flex-col items-center cursor-pointer hover:scale-105 transform transition ${getBgClass(
              cardStates[char.name]
            )}`}
            onClick={() => toggleCardState(char.name)}
          >
            {/* Image container with overlay */}
            <div className="relative w-32 h-32 mb-2 flex items-center justify-center rounded-lg overflow-hidden bg-gray-200">
              <img
                src={char.img}
                alt={char.name}
                className="max-w-full max-h-full object-contain"
              />
              {getOverlay(cardStates[char.name])}
            </div>
            <p className="font-semibold text-gray-700">{char.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
