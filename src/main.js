"use strict";
/*global Bone */
/*global Sylvester */
/*global $M */
/*global $V */

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
};

MYAPP.main = function (){
    var canvas = document.getElementById('mainCanvas'),
        context = canvas.getContext('2d'),
        boneChain = [], 
        numBones = 4, 
        jacobian,
        inverseJacobian,
        mouse = MYAPP.event.addMouseListener(canvas),
        e_delta, //will be used for delta mouse movement
        theta_delta, //will be an array with each joint delta rotation angle
        e; //end effector, the last point on the chain

    function createBoneChain(xStart, yStart, numOfBones){
        var boneChain = [];
        boneChain.push(new Bone(xStart, yStart));
        numOfBones--;
        while(numOfBones--){
            boneChain.push(new Bone());
        }
        function connectBone(bone, i){ 

            if(i!==0){
                bone.connect(boneChain[i-1]);
            }  
            if(i%2!==0){
                bone.endPos = bone.endPos.x(-1);  
            }
        }
        boneChain.forEach(connectBone);

        return boneChain;
    }


    boneChain = createBoneChain(canvas.width/2, canvas.height/2, numBones);

    function createJacobian() {

        var jacobianRows = [];

        for(var i = 0; i<numBones;i++){
            var row = boneChain[i].rotationAxis.cross(boneChain[numBones-1].getGlobalEndPos().subtract(boneChain[i].startPos));  
            jacobianRows.push(row.elements);
        }
        
        jacobian = $M(jacobianRows);
        jacobian = jacobian.transpose();

    }

    function createInverseJacobian(){

        if(jacobian.isSquare() && !jacobian.isSingular()){
            inverseJacobian = jacobian.inverse();
        } else {
            //pseudo inverse with damping
            //(A'*A + lambda*I)^-1*A'

            //damping constant
            var lambda = 10.0;
            var square = jacobian.transpose().x(jacobian);
            square = square.add(Sylvester.Matrix.I(numBones).x(Math.pow(lambda,2)));
            var inverseSquare = square.inverse();
            inverseJacobian = inverseSquare.x(jacobian.transpose());
        }
    }

    function draw(bone) {
        bone.draw(context);
    }

    function move(bone, i){

        
        bone.rotateLocally(theta_delta[i]);
        
        if(i !== 0){

            bone.connect(boneChain[i-1]);

        }
    }

    (function drawFrame () {
        window.requestAnimationFrame(drawFrame, mainCanvas);
        context.clearRect(0, 0, canvas.width, canvas.height);

        e = boneChain[numBones-1].getGlobalEndPos();

        e_delta = $V([mouse.x, mouse.y, 0]).subtract(e);

        createJacobian();
        createInverseJacobian();

        theta_delta = (inverseJacobian.x(e_delta)).x(0.08).elements;

        boneChain.forEach(move);
        boneChain.forEach(draw);
    }());
};




if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                                  window.mozRequestAnimationFrame ||
                                  window.msRequestAnimationFrame ||
                                  window.oRequestAnimationFrame ||
                                  function (callback) {
                                    return window.setTimeout(callback, 17 /*~ 1000/60*/);
                                  });
}