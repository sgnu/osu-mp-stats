import { apiKey } from '../secret'

async function apiCall(endpoint, parameters) {
    parameters.k = apiKey
    const url = new URL(`https://osu.ppy.sh/api/${endpoint}`)
    url.search = new URLSearchParams(parameters).toString()
    // console.log(url.search)
    
    const response = await fetch(url)
    let results
    await response.json().then(data => {
        results = data
    })

    return results
}

export { apiCall }