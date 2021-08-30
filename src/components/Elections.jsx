import axios from "axios"
import { v4 as guid } from "uuid"
import { useState, useEffect } from "react"
import City from "../models/city.model"

export default function Elections(props) {
  const [cities, setCities] = useState([])
  const [city, setCity] = useState(new City())

  useEffect(() => {
    const baseUrl = 'https://igti-react-backend.herokuapp.com';
    // const baseUrl = 'http://localhost:3002';
    const reqCities = axios.get(`${baseUrl}/cities`)
    const reqCantidates = axios.get(`${baseUrl}/candidates`)
    const reqElections = axios.get(`${baseUrl}/election`)

    axios.all([reqCities, reqCantidates, reqElections])
      .then(axios.spread((...response) => {
        const [respCities, respCandidates, respElections] = response

        const mapElections = respElections
          .data
          .map(election => includeCandidateInElection(
            election, respCandidates.data
          ))

        const mapCities = respCities
          .data
          .map(city => includeCountingVotesInCity(
            city, mapElections
          ))
          .map(includePercentualVotesInCity)
          .map(city => orderCountingVotes(city, mostVoted))

        setCities(mapCities)
        setCity(mapCities.find(c => c) ?? new City())
      }))
  }, [])

  function includeCandidateInElection(election, candidates) {
    return {
      ...election,
      candidate: candidates.find(c => c.id === election.candidateId)
    }
  }

  function includeCountingVotesInCity(city, elections) {
    return {
      ...city,
      candidates: elections.filter(v => v.cityId === city.id)
    }
  }

  function orderCountingVotes(city, mostVoted) {
    city.candidates = city?.candidates?.sort(mostVoted)
    return city
  }

  function includePercentualVotesInCity(city) {
    city.candidates = city?.candidates?.map((c, i, arr) => {
      c.percentual = (c.votes * 100 / city.presence)
                      .toFixed(2)
                      .replace('.', ',')
      return c
    }) 
    
    return city
  }

  function mostVoted(a, b) {
    if (a.votes > b.votes) return -1
    if (a.votes < b.votes) return 1
    return 0
  }

  function onSelectCity(city) {
    setCity(city)
  }

  return (
    <section>
      <div className="nav">
        {
          cities?.map((c, i) => {
            return (
              <div 
                  className={ city.name === c.name ? 'nav-item active' : 'nav-item' } 
                  onClick={() => onSelectCity(c)}
                  key={guid()}
              >
                {c.name}                               
              </div>
            )
          })
        }
      </div>
      <div className="infoCity">
        <div className="cardCity">
          <div>Num Eleitores:</div>
          <div className="num">{city.votingPopulation.toLocaleString('pt-BR') }</div>
        </div>
        <div className="cardCity">
          <div>Abstenções:</div>
          <div className="num">{city.absence.toLocaleString('pt-BR') }</div>
        </div>
        <div className="cardCity">
          <div>Comparecimento:</div>
          <div className="num">{city.presence.toLocaleString('pt-BR') }</div>
        </div>
        <div className="cardCity">
          <div>Número de Candidatos:</div>
          <div className="num">{city?.candidates?.length }</div>
        </div>
      </div>
      <div className="cards">
        {
          
          

          city?.candidates?.map((c, i, arr) => {
            console.log(c.percentual.replace(',', '.'))
            return (
              <div className="card" key={guid()}>
                <div 
                    className={
                        i === 0 && c.percentual?.replace(',', '.') >= 50 
                          ? 'face front winner' 
                          : i <= 1 && arr[0].percentual?.replace(',', '.') <= 50 
                            ? 'face front secondRound'
                            : 'face front'
                    }
                    key={guid()}>
                  <img src={`/img/${c.candidate.username}.png`} alt="" />
                  <h2>{c.candidate.name}</h2>
                  <div>
                    <i className="far fa-address-card"></i>
                    <h3>{c.votes} votos</h3>
                  </div>
                  <div>
                    <i className="fas fa-percent"></i>
                    <h3>{`${c.percentual}%`}</h3>
                  </div>
                  <div>
                    {
                      i === 0
                        ? <i className="fas fa-thumbs-up"></i>
                        : <i className="fas fa-thumbs-down"></i>
                    }
                    {
                      <h3>
                        {
                          i === 0 && c.percentual?.replace(',', '.') >= 50 
                          ? 'Eleito' 
                          : i <= 1 && arr[0].percentual?.replace(',', '.') <= 50 
                            ? 'Segundo Turno'
                            : 'Não Eleito'
                        }
                      </h3>
                    }
                  </div>
                </div>
                <div className={
                        i === 0 && c.percentual?.replace(',', '.') >= 50 
                          ? 'face back winner' 
                          : i <= 1 && arr[0].percentual?.replace(',', '.') <= 50 
                            ? 'face back secondRound'
                            : 'face back'
                    } key={guid()}>
                  <img src={`/img/${c.candidate.username}-person.png`} alt="" />
                  <h2>{c.candidate.realName}</h2>
                  <div>
                    <i className="fas fa-birthday-cake"></i>
                    <h3>{c.candidate.birthDate}</h3>
                  </div>
                  <div>
                    <i className="fas fa-city"></i>
                    <h3>{c.candidate.homeland}</h3>
                  </div>
                  <div>
                    <i className="fas fa-user"></i>
                    <h3>{c.candidate.species}</h3>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </section>
  )
}