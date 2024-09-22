import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10,  // number of virtual users
    duration: '30s',  // test duration
    cloud: {
        projectID: 3715770,  // your Grafana Cloud project ID
        name: 'Load Impact Cloud',
    }
};

export default function () {
    const url = 'http://localhost:3001/api';  // your API endpoint
    const res = http.get(url);  // using the http.get() method to make a GET request
    
    // Check if the response status is 200 (OK)
    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);  // sleep for 1 second between requests
}
