
let list = `"Nashville, TN", 36.17, -86.78;
"New York, NY", 40.71, -74.00;
"Atlanta, CO", 33.75, -84.39;
"Denver, CO", 39.74, -104.98;
"Seattle, WA", 47.61, -122.33;
"Los Angeles, CA", 34.05, -118.24;
"Memphis, TN", 35.15, -90.05`
class CityMap {
    constructor(cityList) {
        this.array = []
        this.cityList = cityList
        this.northernmost = document.querySelector('#northernmost')
        this.easternmost = document.querySelector('#easternmost')
        this.southernmost = document.querySelector('#southernmost')
        this.westernmost = document.querySelector('#westernmost')
        this.allStates = document.querySelector('#allStates')
        this.nearestCity = document.querySelector('#nearestCity')
        this.cityName = document.querySelector('#cityName')
        this.state = document.querySelector('#state')
        this.latitude = document.querySelector('#latitude')
        this.longitude = document.querySelector('#longitude')
        this.addCity = document.querySelector('#addCity')
        this.searchState = document.querySelector('#searchState')
        this.search = document.querySelector('#search')
        this.searchCity = document.querySelector('#searchCity')
    }
    makeArray() {
        let cityArray
        if (localStorage.getItem("list")) {
            cityArray = localStorage.getItem("list").replace(/\s+/g, '').split(';');
            this.cityList = localStorage.getItem("list")
        }
        else {
            cityArray = this.cityList.replace(/\s+/g, '').split(';');
        }
        cityArray.forEach((item) => {
            let obj = {}
            obj.city = item.split(',')[0].slice(1)
            obj.abbreviation = item.split(',')[1].slice(0, -1)
            obj.lat = item.split(',')[2]
            obj.long = item.split(',')[3]
            this.array.push(obj)
        })
        return this.array
    }
    theMost() {
        let theMostLat = this.array.sort((a, b) => (+a.lat > +b.lat) ? 1 : ((+b.lat > +a.lat) ? -1 : 0));
        this.southernmost.innerHTML = theMostLat[0].city
        this.northernmost.innerHTML = theMostLat[theMostLat.length - 1].city
        let theMostLong = this.array.sort((a, b) => (+a.long > +b.long) ? 1 : ((+b.long > +a.long) ? -1 : 0));
        this.westernmost.innerHTML = theMostLong[0].city
        this.easternmost.innerHTML = theMostLong[theMostLong.length - 1].city

    }
    getAbbreviations() {
        let abbreviations = []
        this.array.forEach((item) => {
            if (!abbreviations.includes(item.abbreviation)) {
                abbreviations.push(item.abbreviation)
            }
        })
        this.allStates.innerHTML = `All states: ${abbreviations.join(' ')}`

    }
    closestCity(lat, long) {
        let newArray = this.array
        newArray.map((item) => {
            let distance = Math.round(Math.sqrt((+item.lat - lat) ** 2 + (+item.long - long) ** 2))
            item.distance = distance
        })
        newArray.sort((a, b) => (+a.distance > +b.distance) ? 1 : ((+b.distance > +a.distance) ? -1 : 0));
        this.nearestCity.innerHTML = `The nearest city: ${newArray[newArray.length - 1].city}`
    }
    add() {
        this.addCity.addEventListener("click", (e) => {
            if (this.cityName.value && this.state.value && this.latitude.value && this.longitude.value) {
                let newCity = `;"${this.cityName.value}, ${this.state.value}", ${this.latitude.value}, ${this.longitude.value}`
                this.cityList += newCity
                this.cityList
                this.save()
                this.makeArray()
                this.getAbbreviations()
                this.theMost()
            }
            else {
                alert("Please, Fill all fields!")
            }
        })
    }
    searchEvent() {
        this.search.addEventListener("click", (e) => {
            if (this.searchState.value) {
                let arr = []
                let searchValue = this.searchState.value
                this.array.forEach((item) => {
                    if (item.abbreviation === searchValue) {
                        arr.push(item.city)
                    }
                })
                if (arr.length) {
                    this.searchCity.innerHTML = `Search cities: ${arr.join(', ')} `
                }
                else {
                    this.searchCity.innerHTML = `Search cities: no results`
                }
            }
            else {
                alert("Please, Fill the search field!")
            }
        })

    }
    save() {
        localStorage.setItem("list", this.cityList);
    }


}
let cityConstructor = new CityMap(list)
cityConstructor.makeArray()
cityConstructor.theMost()
cityConstructor.getAbbreviations()
cityConstructor.closestCity(30, -180)
cityConstructor.searchEvent()
cityConstructor.add()
cityConstructor.save()

let width = 300
height = 300
margin = 40
let radius = Math.min(width, height) / 2 - margin
let svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
let data = {}
let statesArray = cityConstructor.array
statesArray.map(item => {
    if (data[item.abbreviation]) {
        data[item.abbreviation] += 1
    }
    else {
        data[item.abbreviation] = 1
    }
})
let color = d3.scaleOrdinal()
    .domain(data)
    .range(d3.schemeSet2);
let pie = d3.pie()
    .value(function (d) { return d.value; })
let data_ready = pie(d3.entries(data))
let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
svg
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function (d) { return (color(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)
svg
    .selectAll('mySlices')
    .data(data_ready)
    .enter()
    .append('text')
    .text(function (d) { return d.data.key })
    .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
    .style("text-anchor", "middle")
    .style("font-size", 17)