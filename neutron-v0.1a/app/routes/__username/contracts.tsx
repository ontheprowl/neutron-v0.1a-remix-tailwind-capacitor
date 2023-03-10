import { useNavigate, useLoaderData, Outlet } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/server-runtime';
import * as React from 'react'
import { json } from 'remix-utils';
import { firestore } from '../../firebase/neutron-config.server';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore'
import { collection, getDocs } from 'firebase/firestore';


export default function ContractsPage() {
    return (
       <Outlet></Outlet>
    )
}