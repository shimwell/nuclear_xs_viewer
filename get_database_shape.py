

import math
import time

from io import BytesIO, StringIO
import json
from bson import json_util
from bson.objectid import ObjectId
from data_formatting_tools import *
from database_tools import *
# from flask_cors import CORS, cross_origin
import pandas as pd
import re
from natsort import natsorted




 


collection, client, db = connect_to_database()
# collection, client, db = connect_to_docker_database()

all_database_fields = get_database_fields(collection)
print('all_database_fields',all_database_fields)

# # meta_data_fields = get_database_fields(collection, ignore_fields=['Time [sec]', 'Stroke', 'Extens', 'Load', 'Temp1', 'Temp2', 'Temp3'])
# # print(meta_data_fields)

meta_data_fields = find_all_fields_not_of_a_particular_types_in_database(collection,'list')
print('meta_data_fields',meta_data_fields)

axis_option_fields = find_all_fields_of_a_particular_types_in_database(collection,'list')
print('axis_option_fields',axis_option_fields)

# metadata_values=[]
metadata_fields_and_their_distinct_values={}
for entry in meta_data_fields:
    values = natsorted(get_entries_in_field(collection,entry))
    # metadata_values.append(values)
    # values.sort()#(key=natural_keys) 
    metadata_fields_and_their_distinct_values[entry]=values

ordered_metadata_fields = ['Proton number / element','Mass number','Neutron number','MT number / reaction products','Library']
meta_data_fields_and_distinct_entries = []
for field in ordered_metadata_fields:
    print('meta_data_fields_and_distinct_entries', field)
    meta_data_fields_and_distinct_entries.append({'field':[field],'distinct_values':metadata_fields_and_their_distinct_values[field]})




with open('src/filterdata.json', 'w') as outfile:
    json.dump(meta_data_fields_and_distinct_entries, outfile, indent = 4)

file1 = open('src/filterdata.json',"r")
# print(file1[1])
lines = file1.readlines()
file1.close() 

file2 = open('src/filterData.js',"w")
lines[0] = 'const filterData = ['
lines[-1] = '];'
lines.append('')
lines.append('export default filterData;')
file2.writelines(lines)