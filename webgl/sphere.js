/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

Framework.components.push(function(framework, gl){
    var phi = (1+Math.sqrt(5))/2;
        
    var midp = function(v1, v2){
        var x1 = v1[0];
        var y1 = v1[1];
        var z1 = v1[2];
        
        var x2 = v2[0];
        var y2 = v2[1];
        var z2 = v2[2];
        
        var x3 = (x1+x2)/2;
        var y3 = (y1+y2)/2;
        var z3 = (z1+z2)/2;

        return [x3, y3, z3];
    }
    
    var normalize = function(faces, r){
        if(r === undefined){
            var r = 1.0;
        }
        var result = [];
        for(fi in faces){
            var face = faces[fi];
            var new_face = [];
            result.push(new_face);
            for(vi in face){
                var vertex = face[vi];
                var x = vertex[0];
                var y = vertex[1];
                var z = vertex[2];
                var l = Math.sqrt(x*x + y*y + z*z);
                if (l != 0){
                    new_face.push([(r*x)/l, (r*y)/l, (r*z)/l]);
                }
                else{
                    new_face.push([0, 0, 0]);
                }
            }
        }
        return result;
    }
    
    var subdivide = function(faces){
        var result = [];
        for(var i in faces){
            var face = faces[i];
            var v0 = face[0];
            var v1 = face[1];
            var v2 = face[2];

            var va = midp(v0, v1);
            var vb = midp(v1, v2);
            var vc = midp(v2, v0);

            result.push(
                [v0, va, vc],
                [va, v1, vb],
                [vc, vb, v2],
                [va, vb, vc]
            )
        }
        return result;
    }
    
    var vertexlist = function(faces){
        var vertices = [];
        for(var fi in faces){
            var face = faces[fi];
            for(var vi in face){
                var vertex = face[vi];
                var x = vertex[0];
                var y = vertex[1];
                var z = vertex[2];
                vertices.push(x, y, z);
            }
        }
        return vertices;
    }

    var longitude = function(vertex){
        var x = vertex[0];
        var z = vertex[2];
        return Math.atan2(x, z)/(Math.PI*2)+0.5;
    }
    var lattitude = function(vertex){
        var y = vertex[1];
        return Math.acos(y)/Math.PI;
    }
    var diff = function(a, b){
        return Math.abs(a-b);
    }

    var polar_coords = function(faces){
        var coords = [];
        for(var fi in faces){
            var face = faces[fi];
            var l0 = longitude(face[0]);
            var l1 = longitude(face[1]);
            var l2 = longitude(face[2]);

            var d0 = diff(l0, l1);
            var d1 = diff(l0, l2);
            var d3 = diff(l1, l2);
            if(d0 > 0.5 || d1 > 0.5 || d3 > 0.5){
                correct = 1.0;
            }
            else{
                correct = 0.0;
            }

            for(var vi in face){
                var vertex = face[vi];
                var s = longitude(vertex);
                var t = lattitude(vertex);
                if(s > 0.5){
                    coords.push(s-correct, t);
                }
                else{
                    coords.push(s, t);
                }
            }
        }
        return coords;
    }

    var barycentric_coords = function(faces){
        var coords = [];
        for(var fi in faces){
            coords.push(
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            )
        }
        return coords;
    }

    var v1  = [   1,  phi,    0];
    var v2  = [  -1,  phi,    0];
    var v3  = [   0,    1,  phi];
    var v4  = [   0,    1, -phi];
    var v5  = [ phi,    0,    1];
    var v6  = [-phi,    0,    1];
    var v7  = [-phi,    0,   -1];
    var v8  = [ phi,    0,   -1];
    var v9  = [   0,   -1,  phi];
    var v10 = [   0,   -1, -phi];
    var v11 = [  -1, -phi,    0];
    var v12 = [   1, -phi,    0];

    var faces = [
      [ v1,  v2,  v3],  
      [ v2,  v1,  v4],
      [ v1,  v3,  v5],
      [ v2,  v6,  v3],
      [ v2,  v7,  v6],
      [ v2,  v4,  v7],
      [ v1,  v5,  v8],
      [ v1,  v8,  v4],
      [ v9,  v3,  v6],
      [ v3,  v9,  v5],
      [ v4, v10,  v7],
      [ v4,  v8, v10],
      [ v6,  v7, v11],
      [ v6, v11,  v9],
      [ v7, v10, v11],
      [ v5, v12,  v8],
      [v12,  v5,  v9],
      [v12, v10,  v8],
      [v11, v12,  v9],
      [v12, v11, v10]
    ];

    var icosahedron = normalize(faces);

    framework.Sphere = Class({
        __extends__: framework.Drawable,
        __init__: function(radius, subdivisions){
            var subdivisions = subdivisions === undefined ? 3 : subdivisions;
            var template = icosahedron;

            for(var i=0; i<subdivisions; i++){
                template = subdivide(template);
                template = normalize(template);
            }

            var faces = normalize(template, radius);
            this.vbo = new framework.VBO({
                position_3      : vertexlist(faces),
                normal_3        : vertexlist(template),
                texcoord_2      : polar_coords(template),
                barycentric_3   : barycentric_coords(template),
            });
        }
    });
});
