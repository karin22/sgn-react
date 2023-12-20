"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FaPlay, FaPause } from "react-icons/fa";
import { RangeSlider } from "flowbite-react";
interface Country {
  year: number;
  population: number;
  name: string;
}
interface Population {
  year: number;
  total: number;
  country: Country[];
}
const PopulationChart = () => {
  // Your existing code here
  const [population, setPopulation] = useState<Population[]>([]);
  const [year, setYear] = useState(1950);
  const [startYear, setStartYear] = useState(1950);
  const [endYear, setEndYear] = useState(2018);
  const [isPlay, setIsPlay] = useState(false);

  const [sequenceTimer, setSequenceTimer] = useState<any>(undefined);
  useEffect(() => {
    fetchData();
  }, []);

  const getPopulationYear = useMemo(() => {
    return population.filter((x: any) => x.year === year);
  }, [population, year]);

  const getCountry = useMemo(() => {
    return getPopulationYear[0]?.country.filter((_, ind) => ind < 12);
  }, [getPopulationYear]);

  const getAllYears = useMemo(() => {
    return population.map((x) => x.year);
  }, [population]);

  const fetchData = async () => {
    const res = await fetch("http://localhost:8080/api/population", {
      method: "GET",
    });
    const _data = await res.json();
    const populationResult: Population[] = _data.data;
    setPopulation(populationResult);

    const startYearINData = populationResult[0].year;
    const endYearINData = populationResult[populationResult.length - 1].year;

    setStartYear(startYearINData);
    setEndYear(endYearINData);
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
      plotOptions: {
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
          dataLabels: {
            enabled: true,
            formatter: function (this: Highcharts.PointLabelObject) {
              return `${formatNumber(Number(this.y))}`;
            },
          },
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
    </>
  );
};

export default PopulationChart;
