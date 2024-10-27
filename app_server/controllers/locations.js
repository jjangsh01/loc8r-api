var request = require("request");
const apiOptions = {
    server: "http://localhost:3000",
};
if (process.env.NODE_ENV == "production") {
    apiOptions.server = "https://yourapi.com";
}

const homelist = (req, res) => {
    const path = "/api/locations";
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: "GET",
        json: {},
        qs: {
            lng: 126.989697,
            lat: 37.28413,
            maxDistance: 200000,
        },
    };

    request(requestOptions, (err, response, body) => {
        let data = [];

        // 요청 오류 처리
        if (err) {
            console.error("Request error:", err);
            return renderHomepage(req, res, data); // 빈 데이터로 렌더링
        }

        // response가 정의되어 있는지 확인
        const statusCode = response ? response.statusCode : null;

        // 상태 코드가 200이고 body가 배열인지 확인
        if (statusCode === 200 && Array.isArray(body) && body.length) {
            data = body.map((item) => {
                item.distance = formatDistance(item.distance);
                return item;
            });
        } else {
            console.error("No valid response or body:", statusCode, body);
        }

        // 렌더링
        renderHomepage(req, res, data);
    });
};

const renderHomepage = (req, res, responseBody) => {
    let message = null;
    if (!(responseBody instanceof Array)) {
        message = "API lookup error";
        responseBody = [];
    } else {
        if (!responseBody.length) {
            message = "No places found nearby";
        }
    }

    res.render("locations-list", {
        title: "Loc8r - find a place to work with wifi",
        pageHeader: {
            title: "Loc8r",
            strapLine: "Find places to work with wifi near you!",
        },
        sidebar:
            "Looking for wifi and a seat? Loc8r helps you find places\
         to work when out and about. Perhaps with coffee, cake or a pint? \
         Let Loc8r help you find the place you're looking for.",
        locations: responseBody,
        message,
    });
};

const formatDistance = (distance) => {
    let thisDistance = 0;
    let unit = "m";
    if (distance > 1000) {
        thisDistance = parseFloat(distance / 1000).toFixed(1);
        unit = "km";
    } else {
        thisDistance = Math.floor(distance);
    }
    return thisDistance + unit;
};

const showError = (req, res, status) => {
    let title = "";
    let content = "";
    if (status === 404) {
        title = "404, page not found";
        content = "Oh dear. Looks like you can't find this page. Sorry.";
    } else {
        title = `${status}, something's gone wrong`;
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render("generic-text", {
        title,
        content,
    });
};

const renderDetailPage = function (req, res, location) {
    res.render("location-info", {
        title: location.name,
        pageHeader: {
            title: location.name,
        },
        sidebar: {
            context:
                "is on Loc8r because it has accessible wifi and \
                space to sit down with your laptop and get some work done.",
            callToAction:
                "If you've been and you like it or if you\
                don't please leave a review to help other people just like you.",
        },
        location,
    });
    console.log(location);
};

const renderReviewForm = (req, res, { name }) => {
    res.render("location-review-form", {
        title: `Revivew ${name} on Loc8r`,
        pageHeader: { title: `Revivew ${name}` },
        error: req.query.err,
    });
};

const doAddReview = (req, res) => {
    const locationid = req.params.locationid;
    const path = `/api/locations/${locationid}/reviews`;
    const postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review,
    };
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: "POST",
        json: postdata,
    };
    request(requestOptions, (err, { statusCode }, { name }) => {
        console.log(name);
        if (statusCode === 201) {
            res.redirect(`/location/${locationid}`);
        } else if (statusCode == 400 && name && name === "ValidationError") {
            res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
            showError(req, res, statusCode);
        }
    });
};

const getLocationInfo = (req, res, callback) => {
    const path = `/api/locations/${req.params.locationid}`;
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: "GET",
        json: {},
    };
    request(requestOptions, (err, { statusCode }, body) => {
        let data = body;
        if (statusCode === 200) {
            data.coords = {
                lng: body.coords[0],
                lat: body.coords[1],
            };

            callback(req, res, data);
        } else {
            showError(req, res, statusCode);
        }
    });
};

const locationInfo = (req, res) => {
    getLocationInfo(req, res, (req, res, responseData) => renderDetailPage(req, res, responseData));
};
const addReview = (req, res) => {
    getLocationInfo(req, res, (req, res, responseData) => renderReviewForm(req, res, responseData));
};

module.exports = {
    homelist,
    locationInfo,
    addReview,
    doAddReview,
};
