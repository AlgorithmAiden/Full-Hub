;
(async () => {
    //setup the canvas
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")

/**make the canvas always fill the screen**/;
    (function resize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        window.onresize = resize
    })()

    //for this code (as in code before this line), I almost always use the same stuff, so its going to stay here

    //grabs all the repos
    async function fetchUserRepos() {
        const repoResponse = await fetch(`https://api.github.com/users/AlgorithmAiden/repos`)
        const repos = await repoResponse.json()

        const deployedURLs = repos
            .filter(repo => repo.homepage)
            .map(repo => ({
                name: repo.name,
                url: repo.homepage
            }))

        return deployedURLs
    }

    //all the sites
    let sites = await (async () => {
        let out = []
        while (true) {
            try {
                out = await fetchUserRepos()
            }
            catch {
                out = localStorage.getItem('sites')
            }
            if (out.length > 0) break
            console.log('It failed, trying again')
            await new Promise(r => setTimeout(r, 100))
        }
        localStorage.setItem('sites', out)
        return out
    })()

    sites = (() => {
        let quicks = []
        let fulls = []
        let others = []
        for (const site of sites) {
            if (site.name.includes('Quick-')) quicks.push(site)
            else if (site.name.includes('Full-')) fulls.push(site)
            else others.push(site)
        }
        let temp = []
        for (const index in quicks) {
            const quick = quicks[index]
            for (let subindex in fulls) {
                const full = fulls[subindex]
                const name = quick.name.replace('Quick-', '')
                if (full.name.includes(name)) {
                    temp.push(quick)
                    temp.push(full)
                }
            }
        }
        for (const quick of quicks)
            if (!temp.includes(quick))
                temp.push(quick)
        for (const full of fulls)
            if (!temp.includes(full))
                temp.push(full)
        for (const other of others)
            temp.push(other)
        return temp
    })()


    //remember the mouse
    let mouse = { x: canvas.width * 10, y: canvas.height * 10 }
    document.addEventListener('mousemove', e => {
        mouse.x = e.x
        mouse.y = e.y
    })

    //make it work for mobile too
    document.addEventListener('touchmove', e => {
        e = e.changedTouches[e.changedTouches.length - 1]
        mouse.x = e.pageX
        mouse.y = e.pageY
    })

    //listen for clicks
    document.addEventListener('click', e => window.location.href = sites[Math.floor(mouse.y / (canvas.height / sites.length))].url)

    //listen for the mouse leaving
    document.addEventListener('mouseleave', e => {
        mouse.x = canvas.width * 10
        mouse.y = canvas.height * 10
    })

    //the render loop

    //clear the screen
    ctx.fillStyle = 'rgb(0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
        ;
    (function render() {
        //clear the screen
        ctx.fillStyle = 'rgb(0,0,0,.01)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        //create the gradients
        let greenGradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, Math.min(canvas.width, canvas.height) / 2)
        let blueGradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, Math.min(canvas.width, canvas.height) / 2)
        let greenGradientDark = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, Math.min(canvas.width, canvas.height) / 2)
        let blueGradientDark = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, Math.min(canvas.width, canvas.height) / 2)
        greenGradient.addColorStop(0, 'rgb(0,255,0,.1)')
        greenGradient.addColorStop(1, 'rgb(0,25,0,.1)')
        blueGradient.addColorStop(0, 'rgb(0,0,255,.1)')
        blueGradient.addColorStop(1, 'rgb(0,0,25,.1)')
        greenGradientDark.addColorStop(0, 'rgb(0,100,0,.1)')
        greenGradientDark.addColorStop(1, 'rgb(0,10,0,.1)')
        blueGradientDark.addColorStop(0, 'rgb(0,0,100,.1)')
        blueGradientDark.addColorStop(1, 'rgb(0,0,10,.1)')

        //render rows for the boxes
        ctx.textBaseline = 'top'
        ctx.textAlign = 'center'
        ctx.strokeStyle = greenGradient
        const rowHeight = canvas.height / sites.length
        const pad = rowHeight * .1
        for (const index in sites) {
            const site = sites[index]
            if (mouse.y > index * rowHeight + pad && mouse.y < index * rowHeight + rowHeight - pad)
                ctx.fillStyle = blueGradientDark
            else ctx.fillStyle = greenGradientDark
            ctx.fillRect(0, index * rowHeight + pad, canvas.width, rowHeight - pad * 2)
            if (mouse.y > index * rowHeight + pad && mouse.y < index * rowHeight + rowHeight - pad)
                ctx.fillStyle = blueGradient
            else ctx.fillStyle = greenGradient
            ctx.font = `${rowHeight / 2}px arial`
            ctx.fillText(site.name, canvas.width / 2, index * rowHeight + pad)
            ctx.font = `${rowHeight / 4}px arial`
            ctx.fillText(site.url, canvas.width / 2, index * rowHeight + rowHeight / 4 * 3 - pad)
        }

        requestAnimationFrame(render)
    })()

})()
