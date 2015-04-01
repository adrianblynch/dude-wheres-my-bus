# Dude, Where's My Bus?!

## High level overview

In the morning, I want to know when my bus is 6 minutes away and then again at 4 and 2 minutes away.

At 6 minutes I need to get my bag, put my shoes and coat on and be ready to leave.

At 4 minutes I need to be leaving the house.

If it gets to 2 minutes I can make it but I have to run!

## Minimum Viable Product

Given a stop code and a bus number, alert me when my bus is due in N minutes.

## Rest API

The API will be user centric. Internally I'll use TfL datafeeds.

CLIENT > DWMB API > TFL API

*Why not let the client call the API directly?*

Pros:

- The TfL API has usage limitations, connecting from clients I can't easily control the number of requests.
- I can cache calls within the time period restrictions.
- A change to the TfL API can be manged more easily if it's abstracted behind my own API.
- The TfL API is JSON-like, I can change that to regular JSON for the client.

Cons:

- A bottleneak is introduced.

### Base URL

api.dudewheresmybus.com

### Authentication

Initially, a bearer token will be user with plans to use HMAC in the future. See POST /sessions route for details on getting a bearer token.

The token will be accepted in the URL for development purposes but ultimately in an HTTP header.

### Likely endpoints

`POST /session {"username": "username", "password": "password"}`
> `{"id": "xxx-xxx-xxx-xxx"} 201`

`POST /alerts {"stop": "91532"[, "buses": ["336", "W7"]}`
> `201 {"id": "xxx-xxx-xxx-xxx","stop": "91532"[, "buses": ["336", "W7"]}`

`GET /alerts`
>
```
200
[
	{"id": "xxx-xxx-xxx-xxx","stop": "91532"[, "buses": ["336", "W7"]},
	{"id": "xxx-xxx-xxx-xxx","stop": "91532"[, "buses": ["336", "W7"]}
]
```

*Nice to have* a way to request an alert for all buses at a stop except for those specified. Possible payload: `{"stop": "91532"[, "buses": ["*", W7"]}`. All buses expect the W7.

`DELETE /alerts`
> 204

`DELETE /alerts/xxx-xxx-xxx-xxx`
> 204

## Todo

- Add timings to alert payload.

## Plan of attack

### API

- Set up Node, Hapi and Mongo
- Define the routes
- Define the logic
- Test, test, test!

### Web application

- Set up Node and Hapi
- Create login page
- Create alerts page
- Defined routes for the above pages
- Test, test, test?
