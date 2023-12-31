dataSources = [
  {
    name: "Blog FR",
    file: "blog-french.json",
    tipueUri: "https://blog.ilearned.eu/tipuesearch_content.js"
  },
  {
    name: "Main",
    file: "main.json"
  },
  {
    name: "Blog EN",
    file: "blog-english.json",
    tipueUri: "https://en.ilearned.eu/tipuesearch_content.js"
  }
]

dataSource = dataSources[0].file

for (var i = 0; i < dataSources.length; i++) {
  option = document.createElement("option");
  option.innerHTML = dataSources[i].name;
  option.setAttribute('file', dataSources[i].file);
  document.getElementById('selectDataSource').appendChild(option);
}

document.getElementById('selectDataSource').addEventListener('change', function () {
  dataSource = dataSources[this.selectedIndex].file
  tipueUri = dataSources[this.selectedIndex].tipueUri
  updateGraphDays()
  updateData(dataSource, tipueUri)
})

updateData(dataSources[0].file, dataSources[0].tipueUri)

function updateData(dataSource, tipueUri) {
  while (document.getElementById('search').childNodes.length > 5) {
    document.getElementById('search').removeChild(document.getElementById('search').lastChild);
  }
  while (document.getElementById('latest').childNodes.length > 2) {
    document.getElementById('latest').removeChild(document.getElementById('latest').lastChild);
  }

  while (document.getElementById('top10').childNodes.length > 2) {
    document.getElementById('top10').removeChild(document.getElementById('top10').lastChild);
  }

  while (document.getElementById('refer').childNodes.length > 2) {
    document.getElementById('refer').removeChild(document.getElementById('refer').lastChild);
  }

  if (typeof tipueUri != "undefined") {
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          eval(xhr.responseText);
          document.getElementById('articleCount').style.display = "block";
          document.getElementById('latest').style.display = "block";
          fetch(dataSource)
            .then(response => response.json())
            .then(function(json) {
              document.getElementById('articleCount').children[1].innerHTML = tipuesearchData.pages.length + " Articles publiés";

              i = 0;

              document.getElementById('today').children[1].innerHTML = json.visitors.data[0].visitors.count + " Visites";
              document.getElementById('today').children[2].innerHTML = Math.round((json.visitors.data[0].visitors.count - json.visitors.data[1].visitors.count) / json.visitors.data[1].visitors.count * 100) + "%"

              weekViews = 0;
              while (i < 7) {
                weekViews = json.visitors.data[i].visitors.count + weekViews;
                i++;
              }

              i = 7
              lastWeekViews = 0;
              while (i < 14) {
                lastWeekViews = json.visitors.data[i].visitors.count + lastWeekViews;
                i++;
              }

              document.getElementById('week').children[1].innerHTML = weekViews + " Visites";
              document.getElementById('week').children[2].innerHTML = Math.round((weekViews - lastWeekViews) / lastWeekViews * 100) + "%"

              document.getElementById('total').children[1].innerHTML = json.general.unique_visitors + " Visites";

              numberEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

              requestsData = json.requests.data.sort((a, b) => (a.visitors.count < b.visitors.count) ? 1 : ((b.visitors.count < a.visitors.count) ? -1 : 0))
              referData = json.referring_sites.data.sort((a, b) => (a.visitors.count < b.visitors.count) ? 1 : ((b.visitors.count < a.visitors.count) ? -1 : 0))

              i = 0
              while (i < 9) {
                articleContainer = document.createElement("div");
                articleContainer.classList.add('articleContainer');
                articleName = document.createElement('a');
                articleName.innerHTML = numberEmojis[i] + " " + requestsData[i].data.replace(/-/g, ' ').replace(/_/g, ' ');
                articleName.classList.add('articleName')
                articleName.href = "https://ilearned.eu/" + requestsData[i].data + ".html";
                articleView = document.createElement('p');
                articleView.innerHTML = requestsData[i].visitors.count + " Vues";
                articleView.classList.add('visitCount')
                articleContainer.appendChild(articleName);
                articleContainer.appendChild(articleView);
                document.getElementById('top10').appendChild(articleContainer);
                i++;

                if (i + 1 > tipuesearchData.pages.length) {
                  break;
                }
              }

              availableForSearch = json.requests.data

              availableForSearch = availableForSearch.filter(function(obj) {
                loc = "https://ilearned.eu/" + obj.data + ".html"
                hasVal = false;

                if ((obj.data.includes("author")) || (obj.data.includes("about"))) {
                  hasVal = true;
                } else {
                  for (let key in tipuesearchData.pages) {
                    if (tipuesearchData.pages[key].loc == loc) {
                      hasVal = true;
                      break;
                    }
                  }
                }

                return hasVal;
              });

              const fuse = new Fuse(availableForSearch, {
                keys: ['data']
              })

              document.getElementById("searchInput").addEventListener("input", function(e) {
                searchResult = fuse.search(this.value);

                while (document.getElementById('search').childNodes.length > 5) {
                  document.getElementById('search').removeChild(document.getElementById('search').lastChild);
                }

                i = 0
                while (i < 6) {
                  foundElement = searchResult[i].item
                  articleContainer = document.createElement("div");
                  articleContainer.classList.add('articleContainer');
                  articleName = document.createElement('a');
                  articleName.innerHTML = foundElement.data.replace(/-/g, ' ').replace(/_/g, ' ');
                  articleName.classList.add('articleName')
                  articleName.href = "https://ilearned.eu/" + foundElement.data + ".html";
                  articleView = document.createElement('p');
                  articleView.innerHTML = foundElement.visitors.count + " Vues";
                  articleView.classList.add('visitCount')
                  articleContainer.appendChild(articleName);
                  articleContainer.appendChild(articleView);
                  document.getElementById('search').appendChild(articleContainer);

                  i++;
                }
              });


              const fuse2 = new Fuse(json.referring_sites.data, {
                keys: ['data']
              })

              document.getElementById("referrerSearchInput").addEventListener("input", function(e) {
                searchResult = fuse2.search(this.value);

                while (document.getElementById('referrerSearch').childNodes.length > 5) {
                  document.getElementById('referrerSearch').removeChild(document.getElementById('referrerSearch').lastChild);
                }

                i = 0
                while (i < 6) {
                  foundElement = searchResult[i].item
                  articleContainer = document.createElement("div");
                  articleContainer.classList.add('articleContainer');
                  articleName = document.createElement('a');
                  articleName.innerHTML = foundElement.data.replace(/-/g, ' ').replace(/_/g, ' ');
                  articleName.classList.add('articleName')
                  articleName.href = "https://" + foundElement.data;
                  articleView = document.createElement('p');
                  articleView.innerHTML = foundElement.visitors.count + " Visiteurs";
                  articleView.classList.add('visitCount')
                  articleContainer.appendChild(articleName);
                  articleContainer.appendChild(articleView);
                  document.getElementById('referrerSearch').appendChild(articleContainer);

                  i++;
                }
              });

              i = 0
              while (i < 9) {
                articleContainer = document.createElement("div");
                articleContainer.classList.add('articleContainer');
                articleName = document.createElement('a');
                articleName.innerHTML = numberEmojis[i] + " " + referData[i].data.replace(/www./g, '');
                articleName.classList.add('articleName')
                articleName.href = "https://" + referData[i].data;
                articleView = document.createElement('p');
                articleView.innerHTML = referData[i].visitors.count + " Visiteurs";
                articleView.classList.add('visitCount')
                articleContainer.appendChild(articleName);
                articleContainer.appendChild(articleView);
                document.getElementById('refer').appendChild(articleContainer);

                i++;
              }

              timeEmojis = ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘"]

              i = 0
              while (i < 9) {
                articleSlug = result = /[^/]*$/.exec(tipuesearchData.pages[i].loc)[0].slice(0, -5);
                articleData = json.requests.data.find(element => element.data == articleSlug)
                articleContainer = document.createElement("div");
                articleContainer.classList.add('articleContainer');
                articleName = document.createElement('a');
                articleName.innerHTML = timeEmojis[i] + " " + articleData.data.replace(/-/g, ' ').replace(/_/g, ' ');
                articleName.classList.add('articleName')
                articleName.href = "https://ilearned.eu/" + articleData.data + ".html";
                articleView = document.createElement('p');
                articleView.innerHTML = articleData.visitors.count + " Visiteurs";
                articleView.classList.add('visitCount')
                articleContainer.appendChild(articleName);
                articleContainer.appendChild(articleView);
                document.getElementById('latest').appendChild(articleContainer);
                i++;

                if (i + 1 > tipuesearchData.pages.length) {
                  break;
                }
              }
            });
        }
    }
    xhr.open('GET', tipueUri, true);
    xhr.send(null);
  } else {
    fetch(dataSource)
      .then(response => response.json())
      .then(function(json) {
        i = 0;

        document.getElementById('today').children[1].innerHTML = json.visitors.data[0].visitors.count + " Visites";
        document.getElementById('today').children[2].innerHTML = Math.round((json.visitors.data[0].visitors.count - json.visitors.data[1].visitors.count) / json.visitors.data[1].visitors.count * 100) + "%"

        weekViews = 0;
        while (i < 7) {
          weekViews = json.visitors.data[i].visitors.count + weekViews;
          i++;
        }

        i = 7
        lastWeekViews = 0;
        while (i < 14) {
          lastWeekViews = json.visitors.data[i].visitors.count + lastWeekViews;
          i++;
        }

        document.getElementById('week').children[1].innerHTML = weekViews + " Visites";
        document.getElementById('week').children[2].innerHTML = Math.round((weekViews - lastWeekViews) / lastWeekViews * 100) + "%"

        document.getElementById('total').children[1].innerHTML = json.general.unique_visitors + " Visites";

        numberEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

        requestsData = json.requests.data.sort((a, b) => (a.visitors.count < b.visitors.count) ? 1 : ((b.visitors.count < a.visitors.count) ? -1 : 0))
        referData = json.referring_sites.data.sort((a, b) => (a.visitors.count < b.visitors.count) ? 1 : ((b.visitors.count < a.visitors.count) ? -1 : 0))

        i = 0
        while (i < 9) {
          articleContainer = document.createElement("div");
          articleContainer.classList.add('articleContainer');
          articleName = document.createElement('a');
          articleName.innerHTML = numberEmojis[i] + " " + requestsData[i].data.replace(/-/g, ' ').replace(/_/g, ' ');
          articleName.classList.add('articleName')
          articleName.href = "https://ilearned.eu/" + requestsData[i].data + ".html";
          articleView = document.createElement('p');
          articleView.innerHTML = requestsData[i].visitors.count + " Vues";
          articleView.classList.add('visitCount')
          articleContainer.appendChild(articleName);
          articleContainer.appendChild(articleView);
          document.getElementById('top10').appendChild(articleContainer);

          i++;
        }

        availableForSearch = json.requests.data

        const fuse = new Fuse(availableForSearch, {
          keys: ['data']
        })

        document.getElementById("searchInput").addEventListener("input", function(e) {
          searchResult = fuse.search(this.value);

          while (document.getElementById('search').childNodes.length > 5) {
            document.getElementById('search').removeChild(document.getElementById('search').lastChild);
          }

          i = 0
          while (i < 6) {
            foundElement = searchResult[i].item
            articleContainer = document.createElement("div");
            articleContainer.classList.add('articleContainer');
            articleName = document.createElement('a');
            articleName.innerHTML = foundElement.data.replace(/-/g, ' ').replace(/_/g, ' ');
            articleName.classList.add('articleName')
            articleName.href = "https://ilearned.eu/" + foundElement.data + ".html";
            articleView = document.createElement('p');
            articleView.innerHTML = foundElement.visitors.count + " Vues";
            articleView.classList.add('visitCount')
            articleContainer.appendChild(articleName);
            articleContainer.appendChild(articleView);
            document.getElementById('search').appendChild(articleContainer);

            i++;
          }
        });


        const fuse2 = new Fuse(json.referring_sites.data, {
          keys: ['data']
        })

        document.getElementById("referrerSearchInput").addEventListener("input", function(e) {
          searchResult = fuse2.search(this.value);

          while (document.getElementById('referrerSearch').childNodes.length > 5) {
            document.getElementById('referrerSearch').removeChild(document.getElementById('referrerSearch').lastChild);
          }

          i = 0
          while (i < 6) {
            foundElement = searchResult[i].item
            articleContainer = document.createElement("div");
            articleContainer.classList.add('articleContainer');
            articleName = document.createElement('a');
            articleName.innerHTML = foundElement.data.replace(/-/g, ' ').replace(/_/g, ' ');
            articleName.classList.add('articleName')
            articleName.href = "https://" + foundElement.data;
            articleView = document.createElement('p');
            articleView.innerHTML = foundElement.visitors.count + " Visiteurs";
            articleView.classList.add('visitCount')
            articleContainer.appendChild(articleName);
            articleContainer.appendChild(articleView);
            document.getElementById('referrerSearch').appendChild(articleContainer);

            i++;
          }
        });

        i = 0
        while (i < 9) {
          articleContainer = document.createElement("div");
          articleContainer.classList.add('articleContainer');
          articleName = document.createElement('a');
          articleName.innerHTML = numberEmojis[i] + " " + referData[i].data.replace(/www./g, '');
          articleName.classList.add('articleName')
          articleName.href = "https://" + referData[i].data;
          articleView = document.createElement('p');
          articleView.innerHTML = referData[i].visitors.count + " Visiteurs";
          articleView.classList.add('visitCount')
          articleContainer.appendChild(articleName);
          articleContainer.appendChild(articleView);
          document.getElementById('refer').appendChild(articleContainer);

          i++;
        }
      });
      document.getElementById('articleCount').style.display = "none";
      document.getElementById('latest').style.display = "none";
  }
}

function updateGraphDays() {
  fetch(dataSource)
    .then(response => response.json())
    .then(function(json) {
      days = []
      viewByDay = []
      i = 14
      while (i > -1) {
        days.push(json.visitors.data[i].data.slice(-2));
        viewByDay.push(json.visitors.data[i].visitors.count)
        i--;
      }
      ctx = document.getElementById('graphCanvas').getContext('2d');
      document.querySelector(".button.active").classList.remove("active")
      document.querySelectorAll(".button")[0].classList.add("active")
      if (typeof myChart != "undefined") {
        myChart.destroy();
      }
      myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Visites par jour',
            data: viewByDay,
            backgroundColor: [
              '#D83D3D',
              "#973333"
            ],
            borderRadius: 15,
            borderSkipped: false,
            barThickness: 12
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false
              },
            },
            x: {
              beginAtZero: true,
              grid: {
                display: false
              },
            },
          },
        }
      });
    });
}

function updateGraphMonths() {
  fetch(dataSource)
    .then(response => response.json())
    .then(function(json) {
      document.querySelector(".button.active").classList.remove("active")
      document.querySelectorAll(".button")[1].classList.add("active")

      months = []
      viewByMonth = []
      i = 0
      currentMonth = json.visitors.data[i].data.slice(4, -2);
      ii = 0;
      while (i < 12) {
        thisMonthView = 0
        while (json.visitors.data[ii].data.slice(4, -2) == currentMonth) {
          if (ii < json.visitors.data.length - 1) {
            thisMonthView += json.visitors.data[ii].visitors.count
            ii++;
          } else {
            break;
          }
        }

        currentMonth = json.visitors.data[ii - 1].data.slice(4, -2)

        viewByMonth.push(thisMonthView)
        months.push(currentMonth)

        currentMonth = json.visitors.data[ii].data.slice(4, -2)

        i++;
      }
      viewByMonth.reverse();
      months.reverse();

      ctx = document.getElementById('graphCanvas').getContext('2d');
      myChart.destroy();
      myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Visites ce mois',
            data: viewByMonth,
            backgroundColor: [
              '#D83D3D',
              "#973333"
            ],
            borderRadius: 15,
            borderSkipped: false,
            barThickness: 12
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false
              },
            },
            x: {
              beginAtZero: true,
              grid: {
                display: false
              },
            },
          },
        }
      });
    });
}

function updateGraphYears() {
  fetch(dataSource)
    .then(response => response.json())
    .then(function(json) {
      document.querySelector(".button.active").classList.remove("active")
      document.querySelectorAll(".button")[2].classList.add("active")

      years = []
      viewByYear = []
      i = 0
      currentYear = json.visitors.data[i].data.slice(2, -4);
      ii = 0;
      while (i <= json.visitors.data[0].data.slice(2, -4) - json.visitors.data.at(-1).data.slice(2, -4)) {
        thisYearView = 0
        while (json.visitors.data[ii].data.slice(2, -4) == currentYear) {
          if (ii < json.visitors.data.length - 1) {
            thisYearView += json.visitors.data[ii].visitors.count;
            ii++;
          } else {
            break;
          }
        }

        currentYear = json.visitors.data[ii - 1].data.slice(2, -4)

        viewByYear.push(thisYearView)
        years.push(currentYear)

        currentYear = json.visitors.data[ii].data.slice(2, -4)

        i++;
      }
      viewByYear.reverse();
      years.reverse();

      ctx = document.getElementById('graphCanvas').getContext('2d');
      myChart.destroy();
      myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [{
            label: 'Visites ce mois',
            data: viewByYear,
            backgroundColor: [
              '#D83D3D',
              "#973333"
            ],
            borderRadius: 15,
            borderSkipped: false,
            barThickness: 12
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false
              },
            },
            x: {
              beginAtZero: true,
              grid: {
                display: false
              },
            },
          },
        }
      });
    });
}

updateGraphDays()
