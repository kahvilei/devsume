import React from "react";
import {EditProps, PreviewProps} from "@/interfaces/data";
import PreviewSkill from "@/custom/categories/skill/preview";
import EditSkill from "@/custom/categories/skill/edit";
import {ISkill} from "@/custom/categories/skill/model";
import {Lightbulb, UserRound} from "lucide-react";
import PreviewCollaborator from "@/custom/categories/collaborator/preview";
import EditCollaborator from "@/custom/categories/collaborator/edit";
import {ICollaborator} from "@/custom/categories/collaborator/model";

export const config = {
    categories: [
        {
            api: "/api/categories/skill/",
            key: "Skill",
            preview: PreviewSkill as React.FC<PreviewProps<ISkill>>,
            edit: EditSkill as React.FC<EditProps<ISkill>>,
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
            key: "Collaborator",
            preview: PreviewCollaborator as React.FC<PreviewProps<ICollaborator>>,
            edit: EditCollaborator as React.FC<EditProps<ICollaborator>>,
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
            key: "Image",
            queryFields: {
                title: "string",
            },
            names: {
                singular: "image",
                plural: "images"
            }
        }
    ],
    resumes: [
        {
            api: "/api/resumes/development/",
            key: "Development",
            queryFields: {
                title: "string",
            },
            names: {
                singular: "developer resume",
                plural: "developer resumes"
            }
        }
    ]
}

export default config;