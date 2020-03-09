export interface Data {
    kind: string;
    data: Items;
}

export interface Items {
    modhash: string;
    children: Array<Item>;
}

export interface Item {
    kind: string;
    data: ItemData;
}

export interface ItemData {
    domain: any;
    banned_by: any;
    media_embed: any;
    subreddit: any;
    selftext_html: any;
    selftext: any;
    likes: any;
    secure_media: any;
    link_flair_text: any;
    id: string;
    gilded: any;
    secure_media_embed: any;
    clicked: boolean;
    stickied: boolean;
    author: any;
    media: any;
    score: number;
    approved_by: any;
    over_18: boolean;
    hidden: boolean;
    thumbnail: string;
    subreddit_id: any;
    edited: boolean;
    link_flair_css_class: any;
    author_flair_css_class: any;
    downs: number;
    saved: boolean;
    is_self: boolean;
    permalink: string;
    name: string;
    created: number;
    url: string;
    author_flair_text: string;
    title: string;
    created_utc: number;
    ups: number;
    num_comments: number;
    visited: boolean;
    num_reports: any;
    distinguished: any
}