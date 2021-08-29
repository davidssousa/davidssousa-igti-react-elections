export default class City {    
    constructor(id = '', name = '', votingPopulation = 0, absence = 0, presence = 0) {
        this.id = id
        this.name = name
        this.votingPopulation = votingPopulation
        this.absence = absence
        this.presence = presence
    }
}