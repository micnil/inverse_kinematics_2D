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
        boneChain = [],
        numBones = 4,
        jacobian,
        inverseJacobian,
        mouse = MYAPP.event.addMouseListener(canvas),
        e_delta,
        theta_delta,
        e;

    function createBoneChain(xStart, yStart, numOfBones){

        //TODO
        //Check what happens if only 1 bone

        var boneChain = [];
        boneChain.push(new Bone(xStart, yStart));
        numOfBones--;
        while(numOfBones--){
            boneChain.push(new Bone());
        }
        function connectBone(bone, i){
            bone.endPos = bone.endPos.add($V([0,i*10,0]));  

            if(i!==0){
                bone.connect(boneChain[i-1])
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

    };

    function createInverseJacobian(){

        if(jacobian.isSquare() && !jacobian.isSingular()){
            inverseJacobian = jacobian.inverse();
        } else {
            //pseudo inverse with damping
            //(A'*A)^-1*A'
            var lambda = 10.0;
            console.log(jacobian.inspect());
            var square = jacobian.transpose().x(jacobian);
            square = square.add(Sylvester.Matrix.I(square.dimensions().rows).x(Math.pow(lambda,2)));
            var inversee = square.inverse();
            inverseJacobian = inversee.x(jacobian.transpose());
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

        theta_delta = (inverseJacobian.x(e_delta)).x(0.017).elements;

        boneChain.forEach(move);
        boneChain.forEach(draw);
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