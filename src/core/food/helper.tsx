import { StoreItemTags } from "components/FoodItemTag";
import get from 'lodash/get'

export const getUserStoreTags = (payload: any): StoreItemTags[] => {
    const tags: StoreItemTags[] = get(payload, `apps.apps-tags.tags`, [])
    return tags;
}

export const getItemTag = (location: any, itemId: string) => {
    const eachItemTag = get(location, `location.metadata.${itemId}`)?.tags?.trim()
    if (!eachItemTag){
        return;
    }
    let trimTags = eachItemTag?.trim();
    trimTags = trimTags?.split(",").filter(each => each.length);
    return trimTags;
}