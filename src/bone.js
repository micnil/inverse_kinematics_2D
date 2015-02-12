/*global Sylvester */
/*global $V */

var Bone = function (x, y, length){
    this.startPos = (x && y) ? $V([x, y, 0]) : $V([0,0,0]);
    this.length = length || 30;
    this.endPos = $V([this.length, 0, 0]);
    //this.rotation = Sylvester.Matrix.I(3);
    this.rotationAxis = Sylvester.Vector.k;
};

Bone.prototype = {

    draw: function (context) { 
        
        context.save();

        context.fillStyle = "#0000FF";
        context.beginPath();
        context.moveTo(this.startPos.e(1), this.startPos.e(2));
        var globalEnd=this.getGlobalEndPos();
        context.lineTo(globalEnd.e(1), globalEnd.e(2));
        context.stroke();

        context.restore();
        
    },

    connect: function (bone){
        this.startPos=bone.getGlobalEndPos();
    },

    rotateLocally: function (rad){
        //rotation matrix
        var rotation = Sylvester.Matrix.Rotation(rad, this.rotationAxis);

        this.endPos = rotation.x(this.endPos);

    },

    getGlobalEndPos: function(){
        return this.startPos.add(this.endPos);
    }


};