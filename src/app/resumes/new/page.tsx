"use client";

import {DataService} from "@/app/_data";
import AddNewItemPage from "@/app/_components/items/AddNewItemPage";

export default function AddResume() {
    const service = DataService.services.Resume;

    return (
        <AddNewItemPage service={service}></AddNewItemPage>
    );
};