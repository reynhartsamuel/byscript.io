// EquityGrowthChart.jsx
import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import PropTypes from 'prop-types';
import moment from 'moment';
import sortTradesData from '@/app/utils/sortTradesData';
import calculateTradesDataData from '@/app/utils/calcultateTradesData';

function checkIfSortedByTradeNumber(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (Number(arr[i]['Trade #']) > Number(arr[i + 1]['Trade #'])) {
      return [];
    }
  }
  return arr;
}

const EquityGrowthChart = ({ tradesData }) => {
  // REF FOR CHART
  const chartRef = useRef(null);

  // SORT DATA
  const sortedTradesData = sortTradesData(tradesData);

  // STATES
  const [initialCapital, setInitialCapital] = useState(1000);
  const [dateFilter, setDateFilter] = useState({
    startDate: moment(
      sortedTradesData[0]?.['Date/Time'],
      'YYYY-MM-DD HH:mm'
    ).format('YYYY-MM-DD HH:mm'),
    endDate: moment(
      sortedTradesData[sortedTradesData.length - 1]?.['Date/Time'],
      'YYYY-MM-DD HH:mm'
    ).format('YYYY-MM-DD HH:mm'),
  });
  const [tradesDataWithCumulativeCalc, setTradesDataWithCumulativeCalc] =
    useState(
      calculateTradesDataData({
        tradesData: sortedTradesData,
        dateFilter,
        initialCapital,
      })
    );

  function calculate() {
    // console.log(dateFilter);
    const calculatedData = calculateTradesDataData({
      tradesData: sortedTradesData,
      dateFilter,
      initialCapital,
    });
    setTradesDataWithCumulativeCalc(
      calculatedData.sort((a, b) => a.timestamp - b.timestamp)
    );
  }

  useEffect(() => {
    calculate();
  }, []);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    // console.log(sortedTradesData, 'sortedTradesData');

    // CUMULATIVE PROFIT ===============================================================
    // CUMULATIVE PROFIT ===============================================================
    // CUMULATIVE PROFIT ===============================================================
    const cumulativeProfit = tradesDataWithCumulativeCalc.sort((a, b) => a.timestamp - b.timestamp).map((trade) =>
      parseFloat(trade.currentBalance)
    );
    console.log(cumulativeProfit, 'cumulativeProfit');

    // DRAWDOWN ========================================================================
    // DRAWDOWN ========================================================================
    // DRAWDOWN ========================================================================
    const drawdownData = tradesDataWithCumulativeCalc.sort((a, b) => a.timestamp - b.timestamp).map((trade) =>
      parseFloat(trade['Drawdown %'])
    );

    // BUY AND HOLD ====================================================================
    // BUY AND HOLD ====================================================================
    // BUY AND HOLD ====================================================================
    const buyAndHoldEquity = tradesDataWithCumulativeCalc.sort((a, b) => a.timestamp - b.timestamp).map(
      (trade) => trade.buyAndHoldProfit
    );

    // CONSTANTS
    const labels = tradesDataWithCumulativeCalc.sort((a, b) => a.timestamp - b.timestamp).map(
      (trade) => moment(trade['Date/Time'], 'YYYY-MM-DD HH:mm').format('DD MMM YYYY')
    );
    const percentageInset = 100;
    const equityGrowthPercentage =
      Array.isArray(cumulativeProfit) && cumulativeProfit?.length > 0
        ? cumulativeProfit.map(
            (profit) => (profit / initialCapital) * 100 + percentageInset
          )
        : [];
    const mixedChart = new Chart(ctx, {
      type: 'bar', // Default type for the main dataset
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Equity Growth (USD)',
            data: cumulativeProfit,
            type: 'line', // Specify this dataset as a line chart
            borderColor: 'rgba(0, 169, 199, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            fill: true,
          },
          // {
          //   label: 'Buy and Hold (%)',
          //   data: buyAndHoldEquity,
          //   type: 'line', // Specify this dataset as a bar chart
          //   backgroundColor: 'rgba(240, 64, 24, 0.5)',
          //   borderColor: 'rgba(240, 64, 24, 1)',
          //   borderWidth: 1,
          // },
          {
            label: 'Drawdowns (%)',
            data: drawdownData,
            type: 'bar', // Specify this dataset as a bar chart
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColor: 'rgba(255, 99, 132, 0.3)',
            borderWidth: 1,
            yAxisID: 'drawdown-y', // Link to the secondary y-axis
          },
        ],
      },
      options: {
        legend: {
          onHover: function (e) {
            e.target.style.cursor = 'pointer';
          },
        },
        hover: {
          onHover: function (e) {
            var point = this.getElementAtEvent(e);
            if (point.length) e.target.style.cursor = 'pointer';
            else e.target.style.cursor = 'default';
          },
        },
        elements: {
          point: {
            radius: 1,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Equity Growth (%)',
            },
          },
          'drawdown-y': {
            // Secondary y-axis for drawdowns
            type: 'linear',
            position: 'right',
            beginAtZero: false,
            title: {
              display: true,
              text: 'Drawdowns (%)',
            },
            grid: {
              drawOnChartArea: true, // Do not draw grid lines for the secondary axis
            },
            reverse: true, // Reverse the drawdown-y-axis
          },
          x: {
            title: {
              display: true,
              text: 'Date',
            },
            reverse: false, // Reverse the x-axis
          },
        },
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Equity Growth and Drawdowns Chart',
          },
        },
      },
    });

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      mixedChart.destroy();
    };
  }, [tradesData, tradesDataWithCumulativeCalc]);

  return (
    <div>
      <canvas ref={chartRef} width='400' height='200'></canvas>
      {/* <pre>{JSON.stringify(equityGrowthPercentage)}</pre> */}
      <div className='border-2'>
        <div className='grid grid-cols-2 lg:grid-cols-4'>
          <div className='flex flex-col p-2 bg-[#5ce1e6] items-center justify-center'>
            <p className='text-black text-sm'>PnL</p>
            <p className='text-gray-800 text-xl font-bold '>
              {(
                (tradesDataWithCumulativeCalc[
                  tradesDataWithCumulativeCalc.length - 1
                ]?.currentBalance /
                  tradesDataWithCumulativeCalc[0]?.currentBalance) *
                100
              )?.toFixed(2)}
              %
            </p>
          </div>
          <div className='flex flex-col p-2 bg-[#0097b2] items-center justify-center'>
            <p className='text-black text-sm'>Win Rate</p>
            <p className='text-gray-800 text-xl font-bold '>
              {(
                (tradesDataWithCumulativeCalc?.filter(
                  (trade) => trade?.['Profit %'] > 0
                ).length /
                  tradesDataWithCumulativeCalc.length) *
                100
              )?.toFixed(2)}{' '}
              %
            </p>
          </div>
          <div className='flex flex-col p-2 bg-red-400 items-center justify-center'>
            <p className='text-black text-sm'>Drawdown</p>
            <p className='text-gray-800 text-xl font-bold '>
              -{
                tradesDataWithCumulativeCalc.sort(
                  (a, b) => b['Drawdown %'] - a['Drawdown %']
                )[0]?.['Drawdown %']
              }
              %
            </p>
          </div>
          <div className='flex flex-col p-2 bg-[#cdedff] items-center justify-center'>
            <p className='text-black text-sm'>Total Trades</p>
            <p className='text-gray-800 text-xl font-bold '>
              {tradesData?.length}
            </p>
          </div>
        </div>
        <div className='flex gap-2 w-full justify-evenly pb-5 pt-5'>
          <div>
            <label
              htmlFor='date_from'
              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
            >
              Date From
            </label>
            <input
              min={moment(
                sortedTradesData[0]?.['Date/Time'],
                'YYYY-MM-DD HH:mm'
              ).format('YYYY-MM-DD')}
              max={moment(
                sortedTradesData[sortedTradesData.length - 1]?.['Date/Time'],
                'YYYY-MM-DD HH:mm'
              ).format('YYYY-MM-DD')}
              type='date'
              id='date_from'
              className='w-[11rem] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder={dateFilter.startDate}
              required
              onChange={(e) =>
                setDateFilter({
                  ...dateFilter,
                  startDate: moment(e.target.value, 'YYYY-MM-DD').format(
                    'YYYY-MM-DD'
                  ),
                })
              }
              value={dateFilter.startDate}
            />
          </div>
          <div>
            <label
              htmlFor='date_to'
              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
            >
              Date To
            </label>
            <input
              min={moment(
                sortedTradesData[0]?.['Date/Time'],
                'YYYY-MM-DD HH:mm'
              ).format('YYYY-MM-DD')}
              max={moment(
                sortedTradesData[sortedTradesData.length - 1]?.['Date/Time'],
                'YYYY-MM-DD HH:mm'
              ).format('YYYY-MM-DD')}
              type='date'
              id='date_to'
              className='w-[11rem] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder={dateFilter.endDate}
              required
              onChange={(e) =>
                setDateFilter({
                  ...dateFilter,
                  endDate: moment(e.target.value, 'YYYY-MM-DD').format(
                    'YYYY-MM-DD'
                  ),
                })
              }
              value={dateFilter.endDate}
            />
          </div>
          <div>
            <label
              htmlFor='initial_capital'
              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
            >
              Initial Capital (USD)
            </label>
            <input
              onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
              type='number'
              id='initial_capital'
              className='w-[11rem] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder={initialCapital}
              value={initialCapital}
              required
            />
          </div>
          <div>
            <label
              htmlFor='autotrade_period'
              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
            >
              Autotrade Period
            </label>
            <input
              // type='text'
              id='autotrade_period'
              className='cursor-not-allowed w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder={moment(dateFilter.endDate).diff(
                moment(dateFilter.startDate),
                'days'
              )}
              value={
                moment(dateFilter.endDate).diff(
                  moment(dateFilter.startDate),
                  'days'
                ) + ' days'
              }
              required
              disabled
            />
          </div>
        </div>
        <button
          onClick={calculate}
          className='w-full bg-[#e0d0ff] hover:bg-blue-300 text-black font-bold py-2 px-4'
        >
          Calculate
        </button>
      </div>
    </div>
  );
};

export default EquityGrowthChart;

EquityGrowthChart.propTypes = {
  tradesData: PropTypes.array.isRequired,
};
