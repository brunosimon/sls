#!/usr/bin/env node

'use strict'

// Dependencies
let FileTree = require( './FileTree.js' ),
    fs       = require( 'fs' )

// Parameters
let parameters = { all: false, color: false, depth: 2 }

for( let parameter of process.argv )
{
    // All
    if( parameter.match( /^-[a-zA-Z]*a/ ) )
    {
        parameters.all = true
    }

    // Color
    if( parameter.match( /^-[a-zA-Z]*c/ ) )
    {
        parameters.color = true
    }

    // Depth
    if( !isNaN( parseFloat( parameter ) ) && isFinite( parameter ) )
    {
        parameters.depth = ~~parameter
    }
}

// File tree
let fileTree = new FileTree()

// Walk through every file function
function readDir( _dir, _depth = 0 )
{
    // Increase depth
    _depth += 1

    // Read files sync
    let files = fs.readdirSync( _dir )
    
    // Each file found
    for( let name of files )
    {
        let path = _dir + '/' + name

        if( parameters.all || name.indexOf( '.' ) !== 0 )
        {
            if( fs.statSync( path ).isDirectory() )
            {
                if( _depth + 1 > parameters.depth )
                {
                    fileTree.addFolder( path + '(+)' )
                }
                else
                {
                    fileTree.addFolder( path )
                    readDir( path, _depth )
                }
            }
            else
            {
                fileTree.addFile( path )
            }
        }
    }
}

readDir( '.' )

fileTree.describe( true, parameters.color )
