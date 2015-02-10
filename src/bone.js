var Bone = function (x1, y1, x2, y2){

    this.startPos = $V([x1, y1, 0]) || $V.Zero(3);
    /*this.length = length || 10;*/
    /*this.endPos = $V([this.startPos.e(1), this.startPos.e(2) + this.length, 0]);*/
    this.endPos = $V([x2, y2, 0]) || $V.Zero(3);
    this.modelMatrix = Sylvester.Matrix.I(3);
};

Bone.prototype = {

    draw: function (context) { 

        this.startPos = this.modelMatrix.x(this.startPos);
        this.endPos = this.modelMatrix.x(this.endPos);
        
        context.save();

        context.fillStyle = "#0000FF";
        context.beginPath();
        context.moveTo(this.startPos.e(1), this.startPos.e(2));
        context.lineTo(this.endPos.e(1), this.endPos.e(2));
        context.stroke();

        context.restore();
        
    },

    /** 
    * Translates the joint (this.startpoint) to given coordinate (vec3)
    */
    translate: function (coords){

    },

};