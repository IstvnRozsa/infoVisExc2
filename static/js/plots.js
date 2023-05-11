

datasetFilteredByYear = dataset.filter(d => d["year"] === 2016);


// Define the margins and dimensions of the chart
const margin = {top: 20, right: 20, bottom: 60, left: 60};
const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// PCA Scatter plot
var pca_svg = d3.select("#pca_scatter_plot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define x and y scales
var pca_xScale = d3.scaleLinear()
    .domain([d3.min(pca_data.x), d3.max(pca_data.x)])
    .range([0, width]);

var pca_yScale = d3.scaleLinear()
    .domain([d3.min(pca_data.y), d3.max(pca_data.y)])
    .range([height, 0]);

pca_svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(pca_xScale));

pca_svg.append("g")
    .call(d3.axisLeft(pca_yScale));


pca_svg.selectAll("circle")
    .data(d3.zip(pca_data.x, pca_data.y, pca_data.countries, pca_data.country_names))
    .enter()
    .append("circle")
    .attr("cx", d => pca_xScale(d[0]))
    .attr("cy", d => pca_yScale(d[1]))
    .on("mouseover", function (d) {
        // Set a variable on click of a circle
        highlightPoint(d.target.id);
    })
    .attr("id", function (d) {
        return d[2];
    })
    .attr("r", 5)
    .style("fill", "blue")
    .append("title")
    .text(d => d[3]);


// Define the tooltip
const tooltip = d3.select(".tooltip");
var svg = d3.select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define x and y scales
var xScale = d3.scaleLinear()
    .domain([0, d3.max(datasetFilteredByYear, function (d) {
        return d["Agricultural land (% of land area)"];
    })])
    .range([0, width]);

var yScale = d3.scaleLinear()
    .domain([0, d3.max(datasetFilteredByYear, function (d) {
        return d["Death rate, crude (per 1,000 people)"];
    })])
    .range([height, 0]);

// Draw x and y axes
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

svg.append("g")
    .call(d3.axisLeft(yScale));
// Append the x and y axis labels to the SVG container
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .text("Agricultural land (% of land area)");

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(-40, ${height / 2}) rotate(-90)`)
    .text("Death rate, crude (per 1,000 people)");


var previousCountry = "CZE";
var selectedCountry = datasetFilteredByYear.filter(d => d["Country Code"] === previousCountry);
var selectedFeature = "Agricultural land (% of land area)";


function writeToolBox() {
    d3.select("#line_plot_header").text(selectedFeature + " in " + selectedCountry[0]["Country Name"]);
    d3.select("#toolbox_header").text(selectedCountry[0]["Country Name"])
    d3.select("#feature_1").text("Agricultural land (sq. km): " + selectedCountry[0]["Agricultural land (sq. km)"])
    d3.select("#feature_2").text("Arable land (hectares): " + selectedCountry[0]["Arable land (hectares)"])
    d3.select("#feature_3").text("GDP per capita (current US$): " + selectedCountry[0]["GDP per capita (current US$)"])
    d3.select("#feature_4").text("Forest area (sq. km): " + selectedCountry[0]["Forest area (sq. km)"])
}

writeToolBox();


function highlightPoint(selectedData) {
    // Set a variable on click of a circle
    svg.selectAll("circle").style("fill", "blue");
    svg.selectAll("circle#" + selectedData).style("fill", "red");
    pca_svg.selectAll("circle").style("fill", "blue");
    pca_svg.selectAll("circle#" + selectedData).style("fill", "red");

    if (previousCountry !== null) {
        g.selectAll("path#" + previousCountry).style("fill", "grey");
    }

    g.selectAll("path#" + selectedData).style("fill", "red");
    selectedCountry = datasetFilteredByYear.filter(d => d["Country Code"] === selectedData);
    previousCountry = selectedData;
    writeToolBox();
    selectDataByFeature();
}

let selectedDatasetByFeatures = null;

function selectDataByFeature() {
    if (selectedFeature === null) {
        selectedDatasetByFeatures = dataset.filter(d => d["Country Code"] === previousCountry).map(d => ({
            year: d["year"],
            feature: d["Agricultural land (% of land area)"]
        }));
    } else {
        selectedDatasetByFeatures = dataset.filter(d => d["Country Code"] === previousCountry).map(d => ({
            year: d["year"],
            feature: d[selectedFeature]
        }));
    }
    updateLinePlot(selectedDatasetByFeatures);
}

// Draw the scatter plot
svg.selectAll("circle")
    .data(datasetFilteredByYear)
    .enter()
    .append("circle")
    .on("mouseover", function (d) {
        // Set a variable on click of a circle
        highlightPoint(d.target.id);
    })
    .attr("id", function (d) {
        return d["Country Code"];
    })
    .attr("cx", d => xScale(d["Agricultural land (% of land area)"]))
    .attr("cy", d => yScale(d["Death rate, crude (per 1,000 people)"]))
    .attr("r", 5)
    .attr("fill", "blue")
    .append("title")
    .text(d => d["Country Name"]);


/*
*
*
*
*
*
*
----------------------------- Map
*
*
*
*
*
*
*
*/


var highlightedCountries = datasetFilteredByYear.map(item => item["Country Code"]);
const svg2 = d3.select("#d3_demo").attr("viewBox", [0, 0, width, height - 100]);


let projection = d3.geoMercator()
    .center([0, 55])
    .scale(200)
    .translate([width / 2, (height - 100) / 2]);

const pathGenerator = d3.geoPath().projection(projection);

let g = svg2.append("g");

d3
    .json(
        "https://raw.githubusercontent.com/iamspruce/intro-d3/main/data/countries-110m.geojson"
    )
    .then((data) => {
        g
            .selectAll("path")
            .data(data.features)
            .join("path")
            .on("click", function (d) {
                // Set a variable on click of a circle
                highlightPoint(d.target.id);
            })
            .attr("d", pathGenerator)
            .attr("id", function (d) {
                return d.id;

            })
            .attr("class", "country")
            .style("fill", function (d) {
                if (highlightedCountries.includes(d.id)) {
                    // Highlight the country in red if it's in the list of highlighted countries
                    return "grey";
                }
            })
        ;
    });


/*
 *
 *
 *
 *
 *
 *
 ----------------------------- Line Plot
 *
 *
 *
 *
 *
 *
 *
 */


// Select the dropdown element using D3
var dropdown = d3.select("#exampleSelect");
// Populate the dropdown with options from the list
dropdown.selectAll("option")
    .data(Object.keys(datasetFilteredByYear[0]).slice(3)) //you have to slice the list because the first 3 element is not a feature
    .enter()
    .append("option")
    .text(function (d) {
        return d;
    });

// Save the selected element to a variable
dropdown.on("change", function () {
    selectedFeature = d3.select(this).node().value;
    selectedDatasetByFeatures = dataset.filter(d => d["Country Code"] === previousCountry).map(d => ({
        year: d["year"],
        feature: d[selectedFeature]
    }));
    updateLinePlot(selectedDatasetByFeatures);
});


// Sample data
selectedDatasetByFeatures = dataset.filter(d => d["Country Code"] === previousCountry).map(d => ({
    year: d["year"],
    feature: d[selectedFeature]
}));


// append the svg object to the body of the page
const linePlotSvg = d3.select("#line_plot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Initialise a X axis:
const x = d3.scaleLinear().range([0, width]);
const xAxis = d3.axisBottom().scale(x);
linePlotSvg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "myXaxis")

// Initialize an Y axis
const y = d3.scaleLinear().range([height, 0]);
const yAxis = d3.axisLeft().scale(y);
linePlotSvg.append("g")
    .attr("class", "myYaxis")

// Create a function that takes a dataset as input and update the plot:
function updateLinePlot(data) {

    // Create the X axis:
    x.domain([d3.min(data, function (d) {
        return d.year
    }), d3.max(data, function (d) {
        return d.year
    })]);
    linePlotSvg.selectAll(".myXaxis").transition()
        .duration(3000)
        .call(xAxis);

    // create the Y axis
    y.domain([d3.min(data, function (d) {
        return d.feature
    }), d3.max(data, function (d) {
        return d.feature
    })]);
    linePlotSvg.selectAll(".myYaxis")
        .transition()
        .duration(3000)
        .call(yAxis);

    // Create a update selection: bind to the new data
    const u = linePlotSvg.selectAll(".lineTest")
        .data([data], function (d) {
            return d.year
        });

    // Updata the line
    u
        .join("path")
        .attr("class", "lineTest")
        .transition()
        .duration(3000)
        .attr("d", d3.line()
            .x(function (d) {
                return x(d.year);
            })
            .y(function (d) {
                return y(d.feature);
            }))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.5)
}

// At the beginning, I run the update function on the first dataset:
updateLinePlot(selectedDatasetByFeatures);
/*
*
*
*
*
*
*
----------------------------- Table
*
*
*
*
*
*
*
*/


const thead = d3.select("thead");
const headerRow = thead.append("tr");
const headerKeys = Object.keys(datasetFilteredByYear[0]);
headerKeys.forEach(key => headerRow.append("th").text(key));

// Select the table body element
const tbody = d3.select("tbody");

// Create a row for each object in the data array
const rows = tbody.selectAll("tr")
    .data(datasetFilteredByYear)
    .enter()
    .append("tr");

// Add a cell for each property in the data object
rows.selectAll("td")
    .data(d => Object.values(d))
    .enter()
    .append("td")
    .text(d => d)
    .attr("class", "table-cell");
