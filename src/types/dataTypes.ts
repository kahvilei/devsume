// MongoDB operators supported by the backend
import {ITag} from "@/models/categories/Tag";
import {IResume} from "@/models/Resume";
import {IPost} from "@/models/Post";
import {IPerson} from "@/models/categories/Person";

export type MongoOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'regex';

