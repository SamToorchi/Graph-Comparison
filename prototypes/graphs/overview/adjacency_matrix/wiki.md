demo: http://bl.ocks.org/hungvietdo/raw/7f8df0bcd7fba7e531e6/

https://www.youtube.com/watch?v=YaJbc7s1ROg

https://stackoverflow.com/questions/11356001/socket-io-private-message

##StackoOverflow
https://stackoverflow.com/questions/2218999/remove-duplicates-from-an-array-of-objects-in-javascript

I want to merge 2 adjacency matrices in ones with d3.js. Just as example:

Matrix 1:

{
    "nodes":[
        {
            "id": a,
            "year": 1
        },{
            "id": b,
            "year": 1
        },
        {
            "id": c,
            "year": 1
        }
    ],
    "target":[
        {
            "source": a,
            "target": b
        },
        {
            "source": a,
            "target": c
        }
    ]
}

Matrix 2:

{
    "nodes":[
        {
            "id": a,
            "year": 2
        },{
            "id": b,
            "year": 2
        },
        {
            "id": d,
            "year": 2
        }
    ],
    "target":[
        {
            "source": a,
            "target": b
        },
        {
            "source": a,
            "target": d
        }
    ]
}


as you can see, some IDs appear in both matrices, like a and b. And I want to merge this cell in both matrices in ones and change the color of this cell.
can someone give me some ideas how to solve this issue?
