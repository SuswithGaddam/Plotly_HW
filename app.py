import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

engine  = create_engine("sqlite:///db/belly_button_biodiversity.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table
otu = Base.classes.otu
Samples_Metadata = Base.classes.samples_metadata
Samples = Base.classes.samples

#Create python to DB interface
session = Session(engine)

#Build App Routes
#Home Page
@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

#Route to list the samples
@app.route("/names")
def names():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt, session.bind)
    df.set_index('otu_id', inplace = True)

    # Return a list of the column names (sample names)
    return jsonify(list(df.columns))

#Route to list OTU descriptions
@app.route('/otu')
def otu_list():
    otu_res = session.query(otu.lowest_taxonomic_unit_found).all()
    otu_list = []
    for res in otu_res:
        otu_list.append(res[0])
    #conver to json and return the list
    return jsonify(otu_list)

#Route to return json dictionary of sample metadata
@app.route("/metadata/<sample>")
def sample_metadata(sample):
    """Return the MetaData for a given sample."""
    bbtype, sample_number = sample.split("_")
    sample_data = session.query(Samples_Metadata).filter(Samples_Metadata.SAMPLEID == sample_number).all()
    sample_details = {}
    for each in sample_data:
        sample_details["SAMPLEID"] = each.SAMPLEID
        sample_details["ETHNICITY"] = each.ETHNICITY
        sample_details["GENDER"] = each.GENDER
        sample_details["AGE"] = each.AGE
        sample_details["LOCATION"] = each.LOCATION
        sample_details["BBTYPE"] = each.BBTYPE

    #convert to json and return the dictionary
    return jsonify(sample_details)   

#Route to send an object containing otu_id along with the sample values
@app.route("/samples/<sample>")
def samples(sample):
    """Return `otu_ids` and `sample_values`."""
    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt, session.bind)

    # Filter the data based on the sample number and
    # only keep rows with values above 1
    sample_data = df[df[sample]>1].sort_values(by=sample,ascending=False)
    # Format the data to send as json
    data = {
        "otu_ids": sample_data[sample].index.values.tolist(),
        "sample_values": sample_data[sample].values.tolist(),
    }
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
