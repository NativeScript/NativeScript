export function getData() {
    return new Promise((resolve, reject) => {
        const dataCopy = JSON.parse(JSON.stringify(data));

        for (let i = 0; i < data.length; i++) {
            const featured: boolean = i % 5 === 0;
            (<any>dataCopy[i]).featured = featured;

            const randomImageId = Math.floor(Math.random() * 5);
            (<any>dataCopy[i]).image = "~/images/news" + randomImageId + ".jpg";
        }

        setTimeout(() => {
            resolve(dataCopy);
        }, 1000);
    });
}

const data = [
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },

    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" },
    { "id": 1, "title": "Aliquam erat volutpat.", "date": "12/26/2018" },
    { "id": 2, "title": "Aenean fermentum.", "date": "5/8/2018" },
    { "id": 3, "title": "Vestibulum rutrum rutrum neque.", "date": "6/19/2018" }
];
