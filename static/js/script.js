fetch("data.json")
  .then(response => response.json())
  .then(function(json) {
    console.log(json)

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

    document.getElementById('articleCount').children[1].innerHTML = tipuesearch.pages.length + " Articles publiés";

    numberEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]

    requestsData = json.requests.data.sort((a, b) => (a.visitors.count < b.visitors.count) ? 1 : ((b.visitors.count < a.visitors.count) ? -1 : 0))

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

    const fuse = new Fuse(json.requests.data, {
      keys: ['data']
    })

    document.getElementById("searchInput").addEventListener("input", function(e) {
      searchResult = fuse.search(this.value);

      while (document.getElementById('search').childNodes.length > 5) {
        document.getElementById('search').removeChild(document.getElementById('search').lastChild);
      }

      console.log(searchResult)

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
  });

  function updateGraphDays() {
    fetch("data.json")
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
    fetch("data.json")
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
    fetch("data.json")
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
