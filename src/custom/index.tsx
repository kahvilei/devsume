import React from "react";
import {EditProps, PreviewProps} from "@/interfaces/data";
import PreviewSkill from "@/custom/categories/skill/preview";
import EditSkill from "@/custom/categories/skill/edit";
import {ISkill} from "@/custom/categories/skill/model";
import {Lightbulb, UserRound} from "lucide-react";

export const config = {
    categories: [
        {
            api: "/api/categories/skill/",
            key: "skill",
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
                plural: "skill"
            },
            icon: <Lightbulb />,
        },
        {
            api: "/api/categories/collaborator/",
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
            icon: <UserRound />,
        }
    ],
    media: [
        {
            api: "/api/media/image/",
            openEditInModal: true,
            queryFields: {
                title: "string",
            },
            names: {
                singular: "image",
                plural: "images"
            }
        }
    ]
}

export default config;