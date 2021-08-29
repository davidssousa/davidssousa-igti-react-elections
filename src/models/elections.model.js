import City from "./city.model"

export default class ElectionsModel {
    constructor(cities = []) {
        this.cities = cities
        this.citySelected = this.cities.find(c => c) ?? new City()
    }

    setCity(id) {
        console.log('setCity', id)
        this.citySelected = this.cities.find(c => c.id === id) ?? new City()
    }
}