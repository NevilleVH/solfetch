# Instructions
Start the database container:
`docker build -t db .`  
`docker run --name db -d -p 5431:5432 db`

Install dependencies:
`npm install`

Compile and run locally (requires CDK and SAM CLI tools):
`cdk synth`
`sam local invoke FetchFunction --no-event -t ./cdk.out/SolfetchStack.template.json`

# Notes
Unfortunately, due to time constraints, there are a few caveats:
* Error cases for when irradiance data is not available
* Local testing often times out during the request
* This uses a local database due to AWS RDS being a paid service
* The lambda is not deployed to AWS for the above reason
* Lack of unit tests
* Database config should be read from the environment/using secrets