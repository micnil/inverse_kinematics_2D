"use strict";

var MYAPP = MYAPP || {};

MYAPP.event = {
    addMouseListener: function(element) {
        var mouse = {x: 0, y: 0, event: null},
        body_scrollLeft = document.body.scrollLeft,
        element_scrollLeft = document.documentElement.scrollLeft,
        body_scrollTop = document.body.scrollTop,
        element_scrollTop = document.documentElement.scrollTop,
        offsetLeft = element.offsetLeft,
        offsetTop = element.offsetTop;

        element.addEventListener('mousemove', function (event) {
        var x, y;

        if (event.pageX || event.pageY) {
                x = event.pageX;
                y = event.pageY;
            } else {
                x = event.clientX + body_scrollLeft + element_scrollLeft;
                y = event.clientY + body_scrollTop + element_scrollTop;
            }
            x -= offsetLeft;
            y -= offsetTop;

            mouse.x = x;
            mouse.y = y;
            mouse.event = event;
        }, false);

        return mouse;
    }
}

MYAPP.main = function (){
    var canvas = document.getElementById('mainCanvas'),
        context = canvas.getContext('2d'),
        bones = [],
        numBones = 2,
        jacobian,
        inverseJacobian,
        mouse = MYAPP.event.addMouseListener(canvas),
        e_delta,
        theta_delta,
        e;

/*    var j = numBones;
    while (j--) {
        bones.push(new Bone(canvas.width/2, canvas.height/2, 50));
    }*/
    bones.push(new Bone(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2 + 30));
    bones.push(new Bone(bones[bones.length-1].endPos.e(1), bones[bones.length-1].endPos.e(2), bones[bones.length-1].endPos.e(1) + 30, bones[bones.length-1].endPos.e(2)));

    function createJacobian() {

        var jacobianRows = [];
        var i = numBones;
        while(i--){

            //row in jacobian matrix = axis of rotation CROSS (End effector - position of bone i)
            var row = Sylvester.Vector.k.cross(bones[numBones-1].endPos.subtract(bones[i].startPos));  
            jacobianRows.push(row.elements);
        }
        
        jacobian = $M(jacobianRows);
        jacobian = jacobian.transpose();

    };

    function createInverseJacobian(){

        if(jacobian.isSquare() && !jacobian.isSingular()){
            inverseJacobian = jacobian.inverse();
        } else {
            //pseudo inverse
            //A'*(A*A')^-1
            

            var square = jacobian.transpose().x(jacobian);
            var inversee = square.inverse();
            inverseJacobian = inversee.x(jacobian.transpose());
        }
    }

    function draw(bone) {
        bone.draw(context);
    }

    function move(bone, i){
        bone.endPos = bone.endPos.subtract(bone.startPos);
        bone.rotation = Sylvester.Matrix.RotationZ(theta_delta[i]);
        //console.log(bone.rotation.inspect());
        bone.endPos = bone.rotation.x(bone.endPos);
        bone.endPos = bone.endPos.add(bone.startPos);
   /*     if(i < numBones-1){
            var current = bone.endPos.subtract(bone.startPos);
            bones[i+1].startPos = bones[i+1].startPos.add(current); 
        }*/
    }

    (function drawFrame () {
        e = bones[numBones-1].endPos;
        /*console.log("mouse x:%s y:%s",mouse.x,mouse.y);
        console.log(e.inspect());*/
        e_delta = $V([mouse.x, mouse.y, 0]).subtract(e);

        createJacobian();
        createInverseJacobian();

        /*console.log(e_delta.inspect());
        console.log(inverseJacobian.inspect());*/
        theta_delta = (inverseJacobian.x(e_delta)).x(0.016).elements;
        window.requestAnimationFrame(drawFrame, mainCanvas);
        context.clearRect(0, 0, canvas.width, canvas.height);
        bones.forEach(move);
        bones.forEach(draw);
    }());
}




if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                                  window.mozRequestAnimationFrame ||
                                  window.msRequestAnimationFrame ||
                                  window.oRequestAnimationFrame ||
                                  function (callback) {
                                    return window.setTimeout(callback, 17 /*~ 1000/60*/);
                                  });
}