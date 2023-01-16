import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
    Code,
    Function as LambdaFunction,
    Runtime,
} from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { GenericTable } from "./GenericTable";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class SpaceStack extends Stack {
    //Static initialisation of a REST API called SpaceApi
    private api = new RestApi(this, "SpaceApi");
    // Initialisation of a new DynamoDB Table
    private spacesTable = new GenericTable("SpacesTable", "spaceId", this);

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const helloLambda = new LambdaFunction(this, "helloLambda", {
            runtime: Runtime.NODEJS_16_X,
            code: Code.fromAsset(join(__dirname, "..", "services", "hello")),
            handler: "hello.main",
        });

        const helloLambdaWebpack = new LambdaFunction(
            this,
            "helloLambdaWebpack",
            {
                runtime: Runtime.NODEJS_16_X,
                code: Code.fromAsset(
                    join(__dirname, "..", "build", "nodeHelloLambda"),
                ),
                handler: "nodeHelloLambda.handler",
            },
        );

        const helloLambdaNodeJs = new NodejsFunction(
            this,
            "helloLambdaNodeJs",
            {
                entry: join(
                    __dirname,
                    "..",
                    "services",
                    "node-lambda",
                    "hello.ts",
                ),
                handler: "handler",
            },
        );

        // Hello Api Lambda Integration
        // Links an API Gateway to a Lambda Function
        // We added a GET method on the SpaceApi API GateWay that will call the hello lambda function when called

        const helloLambdaIntegration = new LambdaIntegration(helloLambda);
        const helloLambdaResource = this.api.root.addResource("hello");
        helloLambdaResource.addMethod("GET", helloLambdaIntegration);
    }
}
