"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FaPlay, FaPause } from "react-icons/fa";
import { RangeSlider } from "flowbite-react";
interface Country {
  year: number;
  population: number;
  flag: string;
  name: string;
}
interface Population {
  year: number;
  total: number;
  country: Country[];
}
const PopulationChart = () => {
  const [population, setPopulation] = useState<Population[]>([]);
  const [year, setYear] = useState(1950);
  const [startYear, setStartYear] = useState(1950);
  const [endYear, setEndYear] = useState(2018);
  const [isPlay, setIsPlay] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sequenceTimer, setSequenceTimer] = useState<any>(undefined);
  useEffect(() => {
    fetchData();
  }, []);

  const getPopulationYear = useMemo(() => {
    return population.filter((x: any) => x.year === year);
  }, [population, year]);

  const getCountry = useMemo(() => {
    const countryRank = getPopulationYear[0]?.country.filter(
      (_, ind) => ind < 12
    );
    return countryRank;
  }, [getPopulationYear]);

  const getAllYears = useMemo(() => {
    return population.map((x) => x.year);
  }, [population]);

  const fetchFlag = async (name: string) => {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${name}?fullText=true`,
      {
        method: "GET",
      }
    );
    const _data = await res.json();
    if (_data) {
      return _data[0].flags.svg;
    }
  };

  const fetchData = async () => {
    const res = await fetch(
      "https://sgn-exam-api-rr5efoci2a-as.a.run.app/api/population",
      {
        method: "GET",
      }
    );
    const _data = await res.json();
    const populations: Population[] = _data.data;

    populations.forEach((data) => {
      data.country = data.country.map((c, ind) => {
        c.flag = "https://flagcdn.com/fr.svg"; // Default flags

        if (ind < 12) {
          fetchFlag(c.name).then((res) => (c.flag = res));
        }
        return c;
      });

      return data;
    });

    const populationResult: Population[] = populations;
    setPopulation(populationResult);

    const startYearINData = populationResult[0].year;
    const endYearINData = populationResult[populationResult.length - 1].year;

    setStartYear(startYearINData);
    setEndYear(endYearINData);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const formatNumber = (number = 0) => {
    return new Intl.NumberFormat("th").format(number);
  };

  const getSubtitle = () => {
    return `<span style="font-size: 60px; text-align:end;">${year}</span>
          <br>
          <span style="font-size: 22px">
              Total: <b>: ${formatNumber(getPopulationYear[0]?.total)}</b> 
          </span>`;
  };

  const getFlagsImg = (r: any) => {
    return `<img class="w-6 h-6 rounded-full object-cover" src="${
      getCountry?.find((x) => x.name === r)?.flag
    }" />`;
  };

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        animation: {
          duration: 500,
        },
        marginRight: 50,
        height: 600,
        width: 1000,
      },
      title: {
        text: `Population growth per country, ${startYear} to ${endYear}`,
        align: "left",
      },

      legend: {
        enabled: false,
      },
      xAxis: {
        type: "category",
        labels: {
          useHTML: true,
          formatter: function (
            this: Highcharts.AxisLabelsFormatterContextObject
          ) {
            return `<span style="font-size: 10px">
            ${this.value}
        </span>`;
          },
        },
      },

      yAxis: {
        opposite: true,
        tickPixelInterval: 300,
        title: {
          text: null,
        },
      },

      subtitle: {
        useHTML: true,
        text: getSubtitle(),
        floating: true,
        style: {
          textAlign: "end",
        },
        align: "right",
        verticalAlign: "bottom",
      },

      tooltip: {
        outside: true,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            useHTML: true,
            style: {
              left: 0,
            },
            formatter: function (this: Highcharts.PointLabelObject) {
              return `
              <div class="flex items-center gap-2 absolute -left-8 -top-3">
              ${getFlagsImg(this.key)} ${formatNumber(Number(this.y))}</div>`;
            },
          },
        },
        series: {
          animation: true,
          groupPadding: 0,
          pointPadding: 0.1,
          borderWidth: 0,
          colorByPoint: true,
          dataSorting: {
            enabled: true,
            matchByName: true,
          },
          type: "bar",
          dataLabels: {
            enabled: true,
          },
        },
      },
      series: [
        {
          data: getCountry?.map((x) => [x.name, x.population]),
        },
      ],
    };
  }, [getPopulationYear, getCountry]);

  const onPause = useCallback(() => {
    clearTimeout(sequenceTimer);
    setSequenceTimer(undefined);
    setIsPlay(false);
  }, [sequenceTimer]);

  useEffect(() => {
    if (year >= endYear) {
      // Auto-pause
      onPause();
    }
  }, [year, endYear, onPause]);

  const update = (increment: number) => {
    if (increment) {
      setYear((c) => c + increment);
    }
  };
  const onPlay = () => {
    if (year >= endYear) {
      setYear(startYear);
    }
    setSequenceTimer(
      setInterval(function () {
        update(1);
      }, 200)
    );
    setIsPlay(true);
  };

  const onChangeRange = (event: any) => {
    setYear(Number(event.target.value));
  };
  return (
    <>
      {!loading && (
        <div>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />

          <div className="w-full flex gap-6 max-w-[1000px] mx-auto">
            <button
              id="play-pause-button"
              className="grid place-items-center w-20"
              title="play"
              onClick={!isPlay ? onPlay : onPause}
            >
              {!isPlay ? <FaPlay /> : <FaPause />}
            </button>
            <div className="flex-1 overflow-auto">
              <RangeSlider
                onChange={onChangeRange}
                className="w-full pl-4"
                id="default-range"
                value={year}
                min={startYear}
                max={endYear}
              />
              <div className="flex text-[10px] relative gap-1 border-t ml-6">
                {getAllYears.map((x, ind) => {
                  return (
                    <div
                      className={
                        ind % 4 === 0 ? "rang-year" : "rang-year highlight"
                      }
                      key={x}
                    >
                      {ind % 4 === 0 ? (
                        <span className="text-year absolute top-[10px] -left-[10px]">
                          {x}
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PopulationChart;
