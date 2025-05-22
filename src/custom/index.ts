import React from "react";
import {EditProps, PreviewProps} from "@/interfaces/data";
import PreviewSkill from "@/custom/categories/skills/preview";
import EditSkill from "@/custom/categories/skills/edit";
import {ISkill} from "@/custom/categories/skills/model";

export const config = {
    categories: [
        {
            api: "/api/categories/skills/",
            key: "skills",
            preview: PreviewSkill as React.FC<PreviewProps<ISkill>>,
            edit: EditSkill as React.FC<EditProps<ISkill>>,
            openEditInModal: false,
            queryFields: {
                title: "string",
                tags: "string[]",
                description: "string"
            },
            names: {
                singular: "skill",
                plural: "skills"
            },
        },
        {
            api: "/api/categories/collaborators",
            key: "collaborators",
            openEditInModal: false,
            queryFields: {
                title: "string",
                tags: "string[]",
                description: "string"
            },
            names: {
                singular: "collaborator",
                plural: "collaborators"
            },
        }
    ],
    media: [
        {
        api: "/api/media.ts/images",
        openEditInModal: true,
        queryFields: {
            title: "string",
        },
        names: {
            singular: "image",
            plural: "images"
        }
    }]
}

export default config;