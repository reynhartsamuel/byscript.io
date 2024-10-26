'use client';
import React from 'react';
import useFetchData from '../hooks/QueryHook';
import { useUserStore } from '../store/userStore';
import Spinner from './ui/Spinner';
import moment from 'moment';

const AffiliateeComponent = () => {
  const { customer } = useUserStore();
  const { loading, data } = useFetchData({
    type: 'onSnapshot',
    collectionName: 'customers',
    conditions: [
      {
        field: 'affiliatorCustomerId',
        operator: '==',
        value: customer?.id || '',
      },
    ],
    authRequired: true,
    dependencies: [customer?.id],
  });
  return (
    <div className='mt-5 w-full rounded-lg bg-gray-800 p-4 shadow-md font-sans flex flex-col gap-4  cursor-pointer'>
      <p className='text-gray-400 text-sm'>Affiliatee</p>
      {loading ? (
        <Spinner />
      ) : (
        <div className='max-h-96 overflow-scroll'>
          <table className='w-full overflow-scroll text-xs text-left text-gray-500 dark:text-gray-400 mx-auto'>
            <thead className='top-0 right-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
              <tr>
                <th scope='col' className='px-2 py-1 text-xs'>
                  name
                </th>
                <th scope='col' className='px-2 py-1 text-xs'>
                  email
                </th>
                <th scope='col' className='px-2 py-1 text-xs'>
                  joined at
                </th>
                <th scope='col' className='px-2 py-1 text-xs'>
                  subscribe purchase
                </th>
                {/* <th scope='col' className='px-2 py-1 text-xs'>
              id
            </th> */}
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? data.map((x, i) => (
                <tr
                  className='odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700'
                  key={i}
                >
                  <td className='px-2 py-1 text-xs font-medium text-gray-900 whitespace-nowrap dark:text-gray-300'>
                    <div className='flex gap-2 items-center'>
                    <img className="w-10 h-10 rounded-full" src={x?.photoURL || 'https://avatar.iran.liara.run/public'} alt="Rounded avatar" />
                    <p>{x?.name}</p>
                    </div>
                  </td>
                  <td className='px-2 py-1 text-xs font-medium text-gray-900 whitespace-nowrap dark:text-gray-300'>{x?.email}</td>
                  <td className='px-2 py-1 text-xs'>{moment.unix(x?.createdAt?.seconds).format('ddd, DD MMMM YYYY HH:mm')}</td>
                  <td className='px-2 py-1 text-xs whitespace-nowrap'></td>
                </tr>
              )) : <p>No data</p>}
            </tbody>
          </table>
        </div>
      )}
      {/* <p>customerid : {customer?.id}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
};

export default AffiliateeComponent;
